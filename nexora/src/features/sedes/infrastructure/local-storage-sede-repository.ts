import { newSede, type Sede, type SedeInput } from '../domain/sede'
import type { SedeRepository } from '../domain/sede-repository'

const STORAGE_KEY = 'nexora.sedes.v1'
const REMOVED_SEEDS_KEY = 'nexora.sedes.removed-seeds.v1'

function seedKey(sede: Pick<Sede, 'name' | 'address' | 'city'>): string {
  return [sede.name, sede.address, sede.city]
    .map((part) => part.trim().toLowerCase())
    .join('|')
}

const seed = (input: SedeInput): Sede => newSede(input)

export const SEDE_SEEDS: readonly Sede[] = Object.freeze([
  seed({
    name: 'Sede Central Bogotá',
    address: 'Carrera 7 # 71 - 21, Zona Rosa',
    city: 'Bogotá',
    phone: '+57 601 745 2000',
    estado: 'activa',
  }),
  seed({
    name: 'Gran Hotel Medellín',
    address: 'Calle 10 # 43 - 15, El Poblado',
    city: 'Medellín',
    phone: '+57 604 266 8000',
    estado: 'activa',
  }),
  seed({
    name: 'Resort Santa Marta',
    address: 'Av. El Rodadero # 12 - 04',
    city: 'Santa Marta',
    phone: '+57 605 422 1500',
    estado: 'mantenimiento',
  }),
  seed({
    name: 'Casa Caribe Cartagena',
    address: 'Calle del Arsenal # 8 - 22, Bocagrande',
    city: 'Cartagena',
    phone: '+57 605 660 9900',
    estado: 'activa',
  }),
  seed({
    name: 'Hotel Chapinero Norte',
    address: 'Calle 100 # 15 - 55, Chapinero',
    city: 'Bogotá',
    phone: '+57 601 621 3400',
    estado: 'activa',
  }),
  seed({
    name: 'Hospedaje Cali Norte',
    address: 'Av. 6N # 24 - 58, Granada',
    city: 'Cali',
    phone: '+57 602 485 7200',
    estado: 'inactiva',
  }),
  seed({
    name: 'Boutique Barichara',
    address: 'Km 2, Vía San Gil Barichara',
    city: 'Barichara',
    phone: '+57 607 726 8500',
    estado: 'activa',
  }),
  seed({
    name: 'Hotel El Poblado',
    address: 'Carrera 34 # 8A - 40, Provenza',
    city: 'Medellín',
    phone: '+57 604 311 2600',
    estado: 'mantenimiento',
  }),
  seed({
    name: 'Rionegro Confort',
    address: 'Calle 8 # 25 - 17, Centro',
    city: 'Rionegro',
    phone: '+57 604 537 9100',
    estado: 'activa',
  }),
  seed({
    name: 'Bahía Taganga',
    address: 'El Puerto # 3 - 14',
    city: 'Taganga',
    phone: '+57 605 421 3300',
    estado: 'inactiva',
  }),
])

const STATIC_SEDE_KEYS: ReadonlySet<string> = new Set(
  SEDE_SEEDS.map((sede) => seedKey(sede)),
)

export function isStaticSede(
  sede: Pick<Sede, 'name' | 'address' | 'city'>,
): boolean {
  return STATIC_SEDE_KEYS.has(seedKey(sede))
}

function readRemovedSeedKeys(): Set<string> {
  try {
    const raw = window.localStorage.getItem(REMOVED_SEEDS_KEY)
    const parsed = raw ? (JSON.parse(raw) as string[]) : []
    return new Set(Array.isArray(parsed) ? parsed : [])
  } catch {
    return new Set()
  }
}

function writeRemovedSeedKeys(keys: ReadonlySet<string>): void {
  try {
    window.localStorage.setItem(REMOVED_SEEDS_KEY, JSON.stringify([...keys]))
  } catch {
    // almacenamiento no disponible
  }
}

export class LocalStorageSedeRepository implements SedeRepository {
  constructor() {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === null) {
        const removed = readRemovedSeedKeys()
        this.saveAll(SEDE_SEEDS.filter((sede) => !removed.has(seedKey(sede))))
      }
    } catch {
      // almacenamiento no disponible: el repositorio se comporta como vacío
    }
  }

  async list(): Promise<Sede[]> {
    return this.readAll()
  }

  private readAll(): Sede[] {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      const parsed = raw ? (JSON.parse(raw) as Sede[]) : []
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  save(sede: Sede): void {
    const sedes = this.readAll()
    const index = sedes.findIndex((item) => item.id === sede.id)
    if (index >= 0) {
      sedes[index] = sede
    } else {
      sedes.push(sede)
    }
    this.saveAll(sedes)
  }

  remove(id: string): void {
    this.saveAll(this.readAll().filter((sede) => sede.id !== id))
  }

  removeStatic(id: string): void {
    const sede = this.readAll().find((item) => item.id === id)
    if (!sede || !isStaticSede(sede)) return
    const removed = readRemovedSeedKeys()
    removed.add(seedKey(sede))
    writeRemovedSeedKeys(removed)
  }

  private saveAll(sedes: Sede[]): void {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sedes))
    } catch {
      // almacenamiento no disponible
    }
  }
}