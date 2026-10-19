package api

import (
	"log"
	"net"
	"net/http"
	"strings"
	"sync"
	"time"

	"golang.org/x/time/rate"

	"nexora-api-rest/internal/api/httpjson"
)

// rateLimitConfig holds the tunable knobs of the token bucket limiting.
// Rate is the number of requests per second refilled per IP; Burst is the
// maximum one-off allowance; IdleTTL is how long an idle client entry is kept
// before being evicted by the cleanup loop.
type rateLimitConfig struct {
	Rate       float64
	Burst      int
	IdleTTL    time.Duration
	CleanEvery time.Duration
}

// defaultRateLimitConfig is a sane baseline: 10 req/s with a burst of 20.
var defaultRateLimitConfig = rateLimitConfig{
	Rate:       10,
	Burst:      20,
	IdleTTL:    10 * time.Minute,
	CleanEvery: 1 * time.Minute,
}

// rateLimitClient bundles the per-IP limiter with its last seen timestamp so
// idle entries can be garbage collected.
type rateLimitClient struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

// rateLimiter implements a token-bucket limiter per client IP. The map is
// guarded by a single mutex: reads and writes are short, so contention is
// negligible compared with the network round-trip each request already pays.
type rateLimiter struct {
	mu      sync.Mutex
	clients map[string]*rateLimitClient
	cfg     rateLimitConfig
	stop    chan struct{}
}

// newRateLimiter builds a limiter and starts its background cleanup loop.
func newRateLimiter(cfg rateLimitConfig) *rateLimiter {
	rl := &rateLimiter{
		clients: make(map[string]*rateLimitClient),
		cfg:     cfg,
		stop:    make(chan struct{}),
	}
	go rl.cleanupLoop()
	return rl
}

// stopCleanup halts the background loop (used by tests to avoid leaks).
func (rl *rateLimiter) stopCleanup() {
	close(rl.stop)
}

// allow reports whether the IP may proceed and, when denied, does NOT wait
// for the next token. Token bucket semantics: it drains as fast as the rate
// allows and answers immediately when the burst is exhausted.
func (rl *rateLimiter) allow(ip string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	c, ok := rl.clients[ip]
	if !ok {
		// First request: start with a full bucket.
		c = &rateLimitClient{
			limiter:  rate.NewLimiter(rate.Limit(rl.cfg.Rate), rl.cfg.Burst),
			lastSeen: time.Now(),
		}
		rl.clients[ip] = c
	}

	c.lastSeen = time.Now()
	return c.limiter.Allow()
}

// cleanupLoop periodically evicts client entries that have been idle for
// longer than IdleTTL, bounding the map size under high IP churn.
func (rl *rateLimiter) cleanupLoop() {
	ticker := time.NewTicker(rl.cfg.CleanEvery)
	defer ticker.Stop()

	for {
		select {
		case <-rl.stop:
			return
		case <-ticker.C:
			rl.mu.Lock()
			cutoff := time.Now().Add(-rl.cfg.IdleTTL)
			for ip, c := range rl.clients {
				if c.lastSeen.Before(cutoff) {
					delete(rl.clients, ip)
				}
			}
			rl.mu.Unlock()
		}
	}
}

// clientIP extracts the caller's IP. It trusts X-Forwarded-For only when the
// request already arrived through a trusted proxy; otherwise the direct peer
// reported by the TCP stack is used.
func clientIP(r *http.Request) string {
	if forwarded := r.Header.Get("X-Forwarded-For"); forwarded != "" {
		if first := strings.TrimSpace(strings.Split(forwarded, ",")[0]); first != "" {
			return first
		}
	}

	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}

// rateLimitMiddleware wraps the handler chain with the token-bucket limiter.
// Exceeding clients get 429 with a JSON error body; the request never reaches
// the application handlers.
func rateLimitMiddleware(next http.Handler) http.Handler {
	rl := newRateLimiter(defaultRateLimitConfig)
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !rl.allow(clientIP(r)) {
			log.Printf("rate limit exceeded for IP %s: %s %s", clientIP(r), r.Method, r.URL.Path)
			httpjson.WriteError(w, http.StatusTooManyRequests, "too many requests: rate limit exceeded")
			return
		}
		next.ServeHTTP(w, r)
	})
}
