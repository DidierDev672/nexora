import { useEffect, useRef, type ReactNode } from 'react'

export interface InfiniteScrollProps {
  onLoadMore: () => Promise<void> | void
  hasMore: boolean
  isLoading: boolean
  children: ReactNode
  loader?: ReactNode
  endMessage?: ReactNode
  /** Se dispara cuando el sentinela cruza este umbral de visibilidad (0..1). Por defecto 0. */
  threshold?: number
  /** Margin extra del root antes de cruzar el umbral (px). Por defecto 200. */
  rootMargin?: string
  /** Clase para el contenedor raíz. */
  className?: string
}

export function InfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
  children,
  loader,
  endMessage,
  threshold = 0,
  rootMargin = '0px 0px 200px 0px',
  className,
}: InfiniteScrollProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)

  const onLoadMoreRef = useRef(onLoadMore)
  onLoadMoreRef.current = onLoadMore

  const isLoadingRef = useRef(isLoading)
  isLoadingRef.current = isLoading

  const firingRef = useRef(false)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry.isIntersecting) return
        if (!hasMore || isLoadingRef.current) return
        if (firingRef.current) return

        firingRef.current = true
        void Promise.resolve(onLoadMoreRef.current()).finally(() => {
          firingRef.current = false
        })
      },
      { root: null, rootMargin, threshold },
    )

    observer.observe(sentinel)

    return () => observer.disconnect()
  }, [hasMore, isLoading, rootMargin, threshold])

  return (
    <div className={className}>
      {children}

      {isLoading ? (
        loader ?? (
          <div role="status" aria-live="polite" className="flex justify-center py-6">
            <span className="inline-block size-6 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
          </div>
        )
      ) : hasMore ? (
        <div ref={sentinelRef} aria-hidden="true" />
      ) : (
        endMessage
      )}
    </div>
  )
}