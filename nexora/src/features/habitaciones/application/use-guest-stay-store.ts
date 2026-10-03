import { create } from 'zustand'

export interface AssignedGuestItem {
  id: string
  nombreCompleto?: string
  numeroDocumento?: string
}

export interface GuestStayStoreState {
  personIds: string[]
  guests: AssignedGuestItem[]
  setPersonIds: (ids: string[]) => void
  addPersonId: (id: string) => void
  setGuests: (guests: AssignedGuestItem[]) => void
  reset: () => void
}

/**
 * Store de Zustand para centralizar los IDs y nombres de los huéspedes
 * registrados durante el flujo de asignación antes de enviar a POST /stays.
 */
export const useGuestStayStore = create<GuestStayStoreState>((set) => ({
  personIds: [],
  guests: [],
  setPersonIds: (personIds) => set({ personIds }),
  addPersonId: (id) =>
    set((state) => ({
      personIds: state.personIds.includes(id) ? state.personIds : [...state.personIds, id],
    })),
  setGuests: (guests) =>
    set({
      guests,
      personIds: Array.from(new Set(guests.map((g) => g.id).filter(Boolean))),
    }),
  reset: () => set({ personIds: [], guests: [] }),
}))
