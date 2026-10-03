import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { isAxiosError } from 'axios'
import { CreateSede } from '../application/create-sede'
import { GetSedes } from '../application/get-sedes'
import type { Sede, SedeInput } from '../domain/sede'
import type { SedeRepository } from '../domain/sede-repository'
import { sedesListLoadError } from './lib/error-copy'
import { SedesContext, type SedesState } from './sedes-context'

export interface SedesProviderProps {
  repository: SedeRepository
  children: ReactNode
}

export function SedesProvider({ repository, children }: SedesProviderProps) {
  const [sedes, setSedes] = useState<Sede[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const reload = useCallback(() => {
    setIsLoading(true)
    setLoadError(null)
    setReloadKey((prev) => prev + 1)
  }, [])

  useEffect(() => {
    let active = true
    GetSedes(repository)()
      .then((list) => {
        if (active) setSedes(list)
      })
      .catch((error: unknown) => {
        if (active) {
          const status = isAxiosError(error) ? error.response?.status : undefined
          setLoadError(sedesListLoadError(status))
        }
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [repository, reloadKey])

  const create = useCallback(
    (input: SedeInput): Sede => {
      const sede = CreateSede(repository)(input)
      setSedes((prev) => [sede, ...prev])
      return sede
    },
    [repository],
  )

  const remove = useCallback(
    (id: string) => {
      repository.remove(id)
      setSedes((prev) => prev.filter((sede) => sede.id !== id))
    },
    [repository],
  )

  const removeStatic = useCallback(
    (id: string) => repository.removeStatic(id),
    [repository],
  )

  const value = useMemo<SedesState>(
    () => ({ sedes, isLoading, loadError, reload, create, remove, removeStatic }),
    [sedes, isLoading, loadError, reload, create, remove, removeStatic],
  )

  return <SedesContext.Provider value={value}>{children}</SedesContext.Provider>
}