import { useCallback, useEffect, useState } from 'react'
import { readAuthTokenEmail, readTokenEmail } from '../../../shared/auth-storage'
import type { ClientSession, PersonApiResponse } from '../domain/reserva'
import type { ReservaRepository } from '../domain/reserva-repository'

export interface UseClientSessionResult {
  clientSession: ClientSession
  availablePersons: PersonApiResponse[]
  isReservingForOther: boolean
  selectedPersonId: string
  loadingSession: boolean
  toggleReservingForOther: (forOther: boolean) => void
  setSelectedPersonId: (id: string) => void
  refreshSession: () => Promise<void>
}

export function useClientSession(repository: ReservaRepository): UseClientSessionResult {
  const [clientSession, setClientSession] = useState<ClientSession>({
    email: '',
    name: 'Invitado',
    isAuthenticated: false,
  })
  const [availablePersons, setAvailablePersons] = useState<PersonApiResponse[]>([])
  const [isReservingForOther, setIsReservingForOther] = useState(false)
  const [selectedPersonId, setSelectedPersonId] = useState<string>('')
  const [loadingSession, setLoadingSession] = useState(true)

  const resolveSession = useCallback(async () => {
    setLoadingSession(true)
    try {
      const email = readTokenEmail() || readAuthTokenEmail()
      const isAuth = Boolean(email && email !== 'user_system' && email !== 'admin')

      // Extrae un nombre amigable a partir del email o fallback
      let friendlyName = email ? email.split('@')[0] : 'Invitado'
      if (friendlyName) {
        friendlyName =
          friendlyName.charAt(0).toUpperCase() + friendlyName.slice(1).replace(/[._-]/g, ' ')
      }

      let personId: string | undefined

      try {
        const persons = await repository.getPersons()
        setAvailablePersons(persons)

        // Buscar coincidencia exacta por email
        const matched = persons.find(
          (p) => p.email && p.email.trim().toLowerCase() === email.trim().toLowerCase(),
        )

        if (matched) {
          friendlyName = matched.name
          personId = matched.id
        } else if (persons.length > 0) {
          // Si no hay coincidencia exacta pero hay personas, tomamos la primera como fallback
          personId = persons[0].id
        }
      } catch {
        // En caso de fallo en /persons, se mantiene la sesión decodificada
      }

      const session: ClientSession = {
        email: email || 'usuario@nexora.com',
        name: friendlyName || 'Huésped Titular',
        personId,
        isAuthenticated: isAuth,
      }

      setClientSession(session)
      if (personId) {
        setSelectedPersonId(personId)
      }
    } finally {
      setLoadingSession(false)
    }
  }, [repository])

  useEffect(() => {
    void resolveSession()
  }, [resolveSession])

  const toggleReservingForOther = (forOther: boolean) => {
    setIsReservingForOther(forOther)
    if (!forOther && clientSession.personId) {
      setSelectedPersonId(clientSession.personId)
    }
  }

  return {
    clientSession,
    availablePersons,
    isReservingForOther,
    selectedPersonId,
    loadingSession,
    toggleReservingForOther,
    setSelectedPersonId,
    refreshSession: resolveSession,
  }
}
