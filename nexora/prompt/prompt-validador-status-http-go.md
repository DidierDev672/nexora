# 🧭 Análisis y Optimización de Prompt: Validador de Status Code HTTP en Go (`package httpx`)

## 📋 Diagnóstico y Calificación del Prompt Original

### 📊 Calificación: **8.6 / 10**

> **Desglose de la evaluación:**
> - **Fortalezas notables (+8.6):**
>   1. **Definición de rol clara:** Declara desde la primera línea *"Actúa como un desarrollador senior en Go"*, lo que calibra el nivel de diseño de tipos e idiomaticidad.
>   2. **Requisitos técnicos específicos:** Establece el uso estricto de `net/http`, estructura con `switch`, prohibición de números mágicos y uso de centinelas con `%w`.
>   3. **Listado explícito de códigos:** Detalla exhaustivamente los 18 códigos HTTP a contemplar más el rango `default`.
>   4. **Entregables bien delimitados:** Exige `status.go`, `status_test.go` con *table-driven tests* y un cliente de ejemplo que gestione el cierre de `resp.Body`.
>   5. **Restricción de dependencias:** Solo biblioteca estándar de Go.
>
> - **Fallas y ambigüedades detectadas (-1.4):**
>   1. **Firma y semántica de retorno para 1xx y 3xx (Patrón 1 - Ambigüedad funcional):**
>      - El prompt dice *"devuelve un error (o nil si el código es exitoso)"*, pero no aclara qué ocurre con los códigos informativos (1xx) y las redirecciones (3xx). En HTTP, un 301/302 no es un 2xx pero tampoco es un error de cliente o servidor. ¿Debe devolver `nil` o un centinela `ErrRedirection` / `ErrInformational`? Dejar esto al azar hace que el LLM invente el comportamiento entre ejecuciones.
>   2. **Jerarquía y diseño de los errores centinela (Patrón 1 - Vaguedad en diseño de APIs):**
>      - Pide *"define errores centinela con errors.New y envuélvelos con fmt.Errorf(... %w, err)"*. No aclara si debe haber 5 centinelas por categoría o 18 centinelas individuales para cada código. En Go idiomático, se definen centinelas base por categoría (`ErrInformational`, `ErrRedirection`, `ErrClient`, `ErrServer`, `ErrInvalidStatus`) y opcionalmente centinelas específicos para códigos recurrentes (`ErrNotFound`, `ErrUnauthorized`, `ErrTooManyRequests`).
>   3. **Nombre y firma de la función principal (Patrón 3 - Especificación técnica):**
>      - No especifica el nombre de la función principal (p. ej. `Validate(status int) error` o `ValidateResponse(resp *http.Response) error`).
>   4. **Erratas tipográficas menores (Patrón 3):**
>      - *"valide es status code"* -> *"valide el código de estado"*.
>      - *"por favort"* -> *"por favor"*.

---

### 🔍 Tabla de Problemas Detectados

| Patrón | Severidad | Descripción del problema en TU prompt |
|---|:---:|---|
| **Patrón 1 — Ambigüedad en códigos 1xx y 3xx** | 🟠 Media | *"devuelve un error (o nil si es exitoso)"*: No define explícitamente si las redirecciones (3xx) e informativos (1xx) se tratan como éxito (`nil`) o como error centinela (`ErrRedirection`, `ErrInformational`). |
| **Patrón 1 — Granularidad indefinida de errores centinela** | 🟠 Media | Pide centinelas y envoltura con `%w`, pero no delimita si son por categoría, por código o ambos, lo que provoca resultados inconsistentes entre modelos. |
| **Patrón 3 — Nombre y firma de función no declarados** | 🟡 Baja | No define la firma exacta de la función (ej. `ValidateStatus(statusCode int) error`). |
| **Patrón 3 — Erratas tipográficas** | 🟡 Baja | *"valide es status code"*, *"por favort"*. |

---

## 🚀 Versiones Mejoradas del Prompt

---

### Versión A — Corrección Mínima
> *Mantiene tu redacción original, corrigiendo erratas y definiendo la firma y el comportamiento de 1xx y 3xx.*

```markdown
Actúa como un desarrollador senior en Go.
Necesito una función llamada `ValidateStatus(code int) error` que valide el código de estado de una respuesta HTTP usando un `switch`.

## Requisitos
1. Usa exclusivamente las constantes de `net/http` (`http.StatusOK`, `http.StatusNotFound`, etc.), sin números mágicos.
2. Usa un `switch` sin condición (`switch { case ... }`) o sobre el código, eligiendo la alternativa más limpia y legible.
3. Agrupa los códigos por categoría:
   - 1xx: informativos (retorna error `ErrInformational`)
   - 2xx: éxito (retorna `nil`)
   - 3xx: redirección (retorna error `ErrRedirection`)
   - 4xx: error del cliente (retorna error `ErrClient`)
   - 5xx: error del servidor (retorna error `ErrServer`)
4. Maneja de forma explícita estos códigos:
   - 200, 201, 202, 204
   - 301, 302, 304
   - 400, 401, 403, 404, 409, 422, 429
   - 500, 502, 503, 504
5. `default`: Retorna un centinela `ErrInvalidStatus` para códigos desconocidos o fuera de rango (< 100 o > 599).
6. Diseña errores centinela con `errors.New` a nivel de paquete para cada categoría y códigos clave (404, 401, 429), y envuélvelos con `fmt.Errorf("httpx: %d %s: %w", code, http.StatusText(code), err)` para permitir `errors.Is`.
7. Implementa la función auxiliar `IsRetryable(statusCode int) bool` que devuelva `true` para 429, 502, 503 y 504.
8. Comentarios breves y útiles en español.

## Entregables
- Archivo `status.go` bajo el `package httpx`.
- Archivo `status_test.go` con tests basados en tablas (`table-driven tests`) que cubran cada categoría, los códigos explícitos y el caso `default`.
- Un ejemplo de uso ejecutable `main.go` con `http.Client` que realice una petición, valide el código y cierre siempre `resp.Body`.

## Restricciones
- Solo biblioteca estándar de Go, sin librerías externas.
- Código idiomático y sin lógica duplicada.
```

**Cambios realizados:**
- Se corrigió la errata *"valide es status code"*.
- Se especificó el nombre exacto de la función (`ValidateStatus`).
- Se resolvió la ambigüedad de 1xx y 3xx asignándoles sus respectivos centinelas de categoría.
- Se detalló el formato exacto de envoltura de errores con `http.StatusText`.

---

### Versión B — Versión Optimizada para Producción
> *Ideal para una API sólida en Go con jerarquía de errores canónica, struct de error enriquecido (`HTTPStatusError`) y compatibilidad con `errors.Is` y `errors.As`.*

```markdown
Actúa como un arquitecto y desarrollador senior en Go.
Diseña el paquete `httpx` (`package httpx`) para validar y categorizar códigos de estado HTTP en clientes resilientes.

## 1. Diseño de Errores e Interfaces
- Define errores centinela base exportados con `errors.New`:
  - `ErrInformational` (1xx)
  - `ErrRedirection` (3xx)
  - `ErrClient` (4xx)
  - `ErrServer` (5xx)
  - `ErrInvalidStatus` (< 100 o > 599 o no estandarizados)
- Centinelas específicos para fallos comunes: `ErrBadRequest`, `ErrUnauthorized`, `ErrForbidden`, `ErrNotFound`, `ErrConflict`, `ErrUnprocessable`, `ErrTooManyRequests`, `ErrInternalServer`, `ErrBadGateway`, `ErrServiceUnavailable`, `ErrGatewayTimeout`.
- Define un struct enriquecido `StatusError` que implemente la interfaz `error`:
  ```go
  type StatusError struct {
      StatusCode int
      Err        error
  }
  func (e *StatusError) Error() string
  func (e *StatusError) Unwrap() error
  ```

## 2. Lógica de Validación (`ValidateStatus`)
- Firma: `func ValidateStatus(statusCode int) error`
- Estructura con `switch`:
  - Códigos 2xx (200, 201, 202, 204 y resto 2xx): retorna `nil`.
  - Códigos específicos (301, 302, 304, 400, 401, 403, 404, 409, 422, 429, 500, 502, 503, 504): envuelve el centinela específico y el centinela de categoría.
  - Fallback por categorías (100..199, 300..399, 400..499, 500..599).
  - `default`: códigos fuera de rango (< 100 o > 599).
- Usa exclusivamente constantes de `net/http` (`http.StatusOK`, `http.StatusNotFound`, etc.).

## 3. Función Auxiliar de Reintento (`IsRetryable`)
- Firma: `func IsRetryable(statusCode int) bool`
- Retorna `true` únicamente para `http.StatusTooManyRequests` (429), `http.StatusBadGateway` (502), `http.StatusServiceUnavailable` (503) y `http.StatusGatewayTimeout` (504).
- Firma sobrecargada opcional: `func IsRetryableError(err error) bool` que inspecciona el error con `errors.As`.

## 4. Entregables
1. `status.go`: Código completo, documentado en español y con `package httpx`.
2. `status_test.go`: Suite completa con pruebas basadas en tablas (`table-driven tests`), validando:
   - Casos exitosos (retorno `nil`).
   - Verificación de centinelas mediante `errors.Is`.
   - Extracción de metadata mediante `errors.As`.
   - Comprobación de `IsRetryable`.
3. `example/main.go`: Ejemplo de cliente HTTP con `http.Client`, creación de petición con contexto (`context.WithTimeout`), validación de estado y defer para `resp.Body.Close()`.

## 5. Restricciones
- Cero dependencias externas (solo biblioteca estándar `net/http`, `errors`, `fmt`, `testing`, `context`).
- Código idiomático y verificado (`gofmt`, `go vet`).
```

---

### Versión C — Versión Avanzada con XML para Agentes Autónomos
> *Estructurada para modelos de razonamiento (Claude 3.7 / GPT-4o), garantizando reproducibilidad exacta sin alucinaciones.*

```markdown
<role>
Eres un ingeniero principal en Go especializado en librerías cliente HTTP resilientes.
</role>

<task>
Crea el paquete `httpx` que valida códigos de estado HTTP mediante una estructura `switch`, clasificando respuestas y detectando errores reintentables.
</task>

<specifications>
  <constants>
    Usa estrictamente `net/http` (p. ej. `http.StatusOK`, `http.StatusNotFound`). Prohibido usar literales numéricos en las comparaciones del switch.
  </constants>

  <categories>
    - 1xx: Informativo -> Retorna error que envuelve `ErrInformational`
    - 2xx: Éxito -> Retorna `nil`
    - 3xx: Redirección -> Retorna error que envuelve `ErrRedirection`
    - 4xx: Error de Cliente -> Retorna error que envuelve `ErrClient`
    - 5xx: Error de Servidor -> Retorna error que envuelve `ErrServer`
    - Desconocido (< 100 o > 599) -> Retorna error que envuelve `ErrInvalidStatus`
  </categories>

  <explicit_codes>
    200, 201, 202, 204 | 301, 302, 304 | 400, 401, 403, 404, 409, 422, 429 | 500, 502, 503, 504
  </explicit_codes>

  <retryable>
    `IsRetryable(code int) bool` debe retornar true para: 429, 502, 503, 504.
  </retryable>

  <error_handling>
    Usa `errors.New` para centinelas y envuelve con `fmt.Errorf("%w: ...", sentinel)` para preservar compatibilidad con `errors.Is`.
  </error_handling>
</specifications>

<deliverables>
  <file path="httpx/status.go">Implementación completa con package httpx.</file>
  <file path="httpx/status_test.go">Table-driven tests con testing.T cubriendo éxito, cada categoría, códigos explícitos y default.</file>
  <file path="httpx/example/main.go">Ejemplo ejecutable usando http.Client con defer resp.Body.Close().</file>
</deliverables>
```

---

## 💻 Implementación de Referencia en Go (`package httpx`)

A continuación se presenta el código completo resultante que satisface todos los requerimientos con los más altos estándares idiomáticos de Go:

### 1. `httpx/status.go`
```go
package httpx

import (
	"errors"
	"fmt"
	"net/http"
)

// Errores centinela por categoría HTTP
var (
	ErrInformational = errors.New("respuesta informativa (1xx)")
	ErrRedirection   = errors.New("redirección (3xx)")
	ErrClient        = errors.New("error del cliente (4xx)")
	ErrServer        = errors.New("error del servidor (5xx)")
	ErrInvalidStatus = errors.New("código de estado HTTP inválido o fuera de rango")
)

// Errores centinela para códigos específicos frecuentes
var (
	ErrBadRequest          = errors.New("solicitud incorrecta (400 Bad Request)")
	ErrUnauthorized        = errors.New("no autorizado (401 Unauthorized)")
	ErrForbidden           = errors.New("acceso prohibido (403 Forbidden)")
	ErrNotFound            = errors.New("recurso no encontrado (404 Not Found)")
	ErrConflict            = errors.New("conflicto en el recurso (409 Conflict)")
	ErrUnprocessableEntity = errors.New("entidad no procesable (422 Unprocessable Entity)")
	ErrTooManyRequests     = errors.New("demasiadas peticiones (429 Too Many Requests)")

	ErrInternalServerError = errors.New("error interno del servidor (500 Internal Server Error)")
	ErrBadGateway          = errors.New("pasarela incorrecta (502 Bad Gateway)")
	ErrServiceUnavailable  = errors.New("servicio no disponible (503 Service Unavailable)")
	ErrGatewayTimeout      = errors.New("tiempo de espera de pasarela agotado (504 Gateway Timeout)")
)

// ValidateStatus evalúa el código de estado HTTP recibido.
// Retorna nil si el código pertenece a la familia 2xx (éxito).
// En caso contrario, retorna un error que envuelve los centinelas correspondientes.
func ValidateStatus(code int) error {
	switch {
	// --- Fuera de rango o no estandarizados (< 100 o > 599) ---
	case code < 100 || code > 599:
		return fmt.Errorf("httpx: %d no es un código HTTP válido: %w", code, ErrInvalidStatus)

	// --- 2xx: Éxito (retorna nil) ---
	case code == http.StatusOK,
		code == http.StatusCreated,
		code == http.StatusAccepted,
		code == http.StatusNoContent:
		return nil

	case code >= 200 && code < 300:
		// Cualquier otro código 2xx no listado explícitamente sigue siendo exitoso
		return nil

	// --- 1xx: Informativos ---
	case code >= 100 && code < 200:
		return fmt.Errorf("httpx: %d %s: %w", code, http.StatusText(code), ErrInformational)

	// --- 3xx: Redirección ---
	case code == http.StatusMovedPermanently ||
		code == http.StatusFound ||
		code == http.StatusNotModified:
		return fmt.Errorf("httpx: %d %s: %w", code, http.StatusText(code), ErrRedirection)

	case code >= 300 && code < 400:
		return fmt.Errorf("httpx: %d %s: %w", code, http.StatusText(code), ErrRedirection)

	// --- 4xx: Error del cliente con casos explícitos ---
	case code == http.StatusBadRequest:
		return fmt.Errorf("httpx: %w: %w", ErrBadRequest, ErrClient)

	case code == http.StatusUnauthorized:
		return fmt.Errorf("httpx: %w: %w", ErrUnauthorized, ErrClient)

	case code == http.StatusForbidden:
		return fmt.Errorf("httpx: %w: %w", ErrForbidden, ErrClient)

	case code == http.StatusNotFound:
		return fmt.Errorf("httpx: %w: %w", ErrNotFound, ErrClient)

	case code == http.StatusConflict:
		return fmt.Errorf("httpx: %w: %w", ErrConflict, ErrClient)

	case code == http.StatusUnprocessableEntity:
		return fmt.Errorf("httpx: %w: %w", ErrUnprocessableEntity, ErrClient)

	case code == http.StatusTooManyRequests:
		return fmt.Errorf("httpx: %w: %w", ErrTooManyRequests, ErrClient)

	case code >= 400 && code < 500:
		return fmt.Errorf("httpx: %d %s: %w", code, http.StatusText(code), ErrClient)

	// --- 5xx: Error del servidor con casos explícitos ---
	case code == http.StatusInternalServerError:
		return fmt.Errorf("httpx: %w: %w", ErrInternalServerError, ErrServer)

	case code == http.StatusBadGateway:
		return fmt.Errorf("httpx: %w: %w", ErrBadGateway, ErrServer)

	case code == http.StatusServiceUnavailable:
		return fmt.Errorf("httpx: %w: %w", ErrServiceUnavailable, ErrServer)

	case code == http.StatusGatewayTimeout:
		return fmt.Errorf("httpx: %w: %w", ErrGatewayTimeout, ErrServer)

	case code >= 500 && code < 600:
		return fmt.Errorf("httpx: %d %s: %w", code, http.StatusText(code), ErrServer)

	default:
		return fmt.Errorf("httpx: %d desconocido: %w", code, ErrInvalidStatus)
	}
}

// IsRetryable determina si un código HTTP corresponde a un fallo transitorio que amerita reintento.
// Se consideran reintentables: 429 (Too Many Requests), 502 (Bad Gateway),
// 503 (Service Unavailable) y 504 (Gateway Timeout).
func IsRetryable(code int) bool {
	switch code {
	case http.StatusTooManyRequests,
		http.StatusBadGateway,
		http.StatusServiceUnavailable,
		http.StatusGatewayTimeout:
		return true
	default:
		return false
	}
}
```

---

### 2. `httpx/status_test.go`
```go
package httpx_test

import (
	"errors"
	"net/http"
	"testing"

	"nexora-api-rest/shared/httpx" // o el import path correspondiente
)

func TestValidateStatus(t *testing.T) {
	tests := []struct {
		name         string
		code         int
		wantErr      bool
		expectedRoot error
	}{
		// Éxitos (2xx) -> nil
		{"200 OK", http.StatusOK, false, nil},
		{"201 Created", http.StatusCreated, false, nil},
		{"202 Accepted", http.StatusAccepted, false, nil},
		{"204 No Content", http.StatusNoContent, false, nil},
		{"206 Partial Content genérico", http.StatusPartialContent, false, nil},

		// Informativos (1xx)
		{"100 Continue", http.StatusContinue, true, httpx.ErrInformational},
		{"101 Switching Protocols", http.StatusSwitchingProtocols, true, httpx.ErrInformational},

		// Redirecciones (3xx)
		{"301 Moved Permanently", http.StatusMovedPermanently, true, httpx.ErrRedirection},
		{"302 Found", http.StatusFound, true, httpx.ErrRedirection},
		{"304 Not Modified", http.StatusNotModified, true, httpx.ErrRedirection},
		{"307 Temporary Redirect", http.StatusTemporaryRedirect, true, httpx.ErrRedirection},

		// Errores de cliente (4xx) explícitos
		{"400 Bad Request", http.StatusBadRequest, true, httpx.ErrBadRequest},
		{"401 Unauthorized", http.StatusUnauthorized, true, httpx.ErrUnauthorized},
		{"403 Forbidden", http.StatusForbidden, true, httpx.ErrForbidden},
		{"404 Not Found", http.StatusNotFound, true, httpx.ErrNotFound},
		{"409 Conflict", http.StatusConflict, true, httpx.ErrConflict},
		{"422 Unprocessable Entity", http.StatusUnprocessableEntity, true, httpx.ErrUnprocessableEntity},
		{"429 Too Many Requests", http.StatusTooManyRequests, true, httpx.ErrTooManyRequests},
		{"418 Teapot (4xx no explícito)", http.StatusTeapot, true, httpx.ErrClient},

		// Errores de servidor (5xx) explícitos
		{"500 Internal Server Error", http.StatusInternalServerError, true, httpx.ErrInternalServerError},
		{"502 Bad Gateway", http.StatusBadGateway, true, httpx.ErrBadGateway},
		{"503 Service Unavailable", http.StatusServiceUnavailable, true, httpx.ErrServiceUnavailable},
		{"504 Gateway Timeout", http.StatusGatewayTimeout, true, httpx.ErrGatewayTimeout},
		{"505 HTTP Version Not Supported", http.StatusHTTPVersionNotSupported, true, httpx.ErrServer},

		// Casos default / fuera de rango
		{"0 Inválido", 0, true, httpx.ErrInvalidStatus},
		{"99 Fuera de rango", 99, true, httpx.ErrInvalidStatus},
		{"600 Fuera de rango", 600, true, httpx.ErrInvalidStatus},
		{"999 Inválido", 999, true, httpx.ErrInvalidStatus},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := httpx.ValidateStatus(tt.code)
			if (err != nil) != tt.wantErr {
				t.Fatalf("ValidateStatus(%d) error = %v, wantErr %v", tt.code, err, tt.wantErr)
			}
			if tt.wantErr && tt.expectedRoot != nil {
				if !errors.Is(err, tt.expectedRoot) {
					t.Errorf("ValidateStatus(%d) no envuelve el centinela esperado %v; obtenido: %v", tt.code, tt.expectedRoot, err)
				}
			}
		})
	}
}

func TestIsRetryable(t *testing.T) {
	retryables := []int{
		http.StatusTooManyRequests,
		http.StatusBadGateway,
		http.StatusServiceUnavailable,
		http.StatusGatewayTimeout,
	}

	for _, code := range retryables {
		if !httpx.IsRetryable(code) {
			t.Errorf("IsRetryable(%d) debió ser true", code)
		}
	}

	nonRetryables := []int{
		http.StatusOK,
		http.StatusBadRequest,
		http.StatusUnauthorized,
		http.StatusForbidden,
		http.StatusNotFound,
		http.StatusInternalServerError,
	}

	for _, code := range nonRetryables {
		if httpx.IsRetryable(code) {
			t.Errorf("IsRetryable(%d) debió ser false", code)
		}
	}
}
```

---

### 3. `httpx/example/main.go`
```go
package main

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"time"

	"nexora-api-rest/shared/httpx" // sustituir por el path del módulo
)

func main() {
	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, "https://api.ejemplo.com/recurso", nil)
	if err != nil {
		fmt.Printf("Error al crear la petición: %v\n", err)
		return
	}

	resp, err := client.Do(req)
	if err != nil {
		fmt.Printf("Fallo de red o timeout: %v\n", err)
		return
	}
	defer resp.Body.Close() // Garantía de liberación de recursos

	// Validación centralizada del código de estado HTTP
	if err := httpx.ValidateStatus(resp.StatusCode); err != nil {
		fmt.Printf("Validación fallida: %v\n", err)

		// Verificación de reintentos
		if httpx.IsRetryable(resp.StatusCode) {
			fmt.Println("-> La solicitud puede reintentarse tras un backoff.")
		}

		// Inspección semántica con errors.Is
		if errors.Is(err, httpx.ErrNotFound) {
			fmt.Println("-> El recurso solicitado no existe.")
		} else if errors.Is(err, httpx.ErrClient) {
			fmt.Println("-> Error imputable a la solicitud del cliente.")
		} else if errors.Is(err, httpx.ErrServer) {
			fmt.Println("-> Error interno del servidor remoto.")
		}
		return
	}

	fmt.Println("¡Respuesta exitosa! Procesando datos del body...")
}
```

---

## 🎓 Lecciones para tus próximos prompts

**Lo que hiciste bien:**
1. **Especificar restricciones negativas y positivas:** El uso de constantes (`net/http`) en lugar de números mágicos y la delimitación de solo biblioteca estándar aseguran código de alta calidad.
2. **Listado taxativo de casos edge:** Proveer explícitamente los 18 códigos HTTP ahorra iteraciones y evita que el modelo seleccione códigos al azar.

**3 hábitos para mejorar:**

1. **Define la semántica completa de casos no exitosos pero válidos:**
   En HTTP, 1xx y 3xx no son errores de fallo técnico, pero tampoco son respuestas completas con datos. Indicar qué debe devolver la función para cada familia evita asunciones.
   → *Regla de oro: "Dile al modelo el resultado esperado de cada camino posible, no solo del camino feliz."*

2. **Declara la firma exacta de las funciones clave:**
   Si necesitas una función específica, dale el nombre y sus tipos (`func ValidateStatus(code int) error`). Esto garantiza que el código sea directamente integrable sin renombrar símbolos.
   → *Regla de oro: "Nombrar la función en el prompt es asegurar la interfaz de tu código."*

3. **Indica el patrón de anidamiento de errores (`%w`):**
   Al solicitar centinelas y envoltura, especifica si el error debe envolver tanto el centinela específico como el de categoría (`fmt.Errorf("%w: %w", ErrNotFound, ErrClient)`), permitiendo usar `errors.Is` en ambos niveles.
   → *Regla de oro: "Diseña la jerarquía de errores antes de pedir la implementación."*
