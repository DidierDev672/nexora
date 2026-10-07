/**
 * Catálogo Maestro Compartido (Shared Catalog Kernel).
 * Provee consumo centralizado y reutilizable de:
 * - Huéspedes (GET /person/{id})
 * - Habitaciones (GET /room/{id})
 * - Tipos de Habitación (GET /room-types/{id})
 * - Tipos de Cama (GET /types-bed/{id})
 * - Edificios (GET /building/{id})
 * - Sedes (GET /headquarters/{id})
 * - Subsedes (GET /sub-headquarters/{id})
 *
 * Cumplimiento de arquitectura:
 * - Vertical Slicing + Hexagonal (domain -> infrastructure -> application -> ui)
 * - Atomic Design (atoms -> molecules -> organisms)
 * - 100% en español, sin exposición de IDs técnicos para experiencia de usuario.
 */

// 1. Dominio y contratos
export * from './domain/catalog-types'
export * from './domain/catalog-translations'

// 2. Infraestructura y API
export * from './infrastructure/catalog-api-client'
export * from './infrastructure/catalog-fallbacks'

// 3. Aplicación y Hooks
export * from './application/use-catalog'

// 4. UI: Átomos
export * from './ui/atoms/catalog-status-badge'
export * from './ui/atoms/catalog-pill'

// 5. UI: Moléculas
export * from './ui/molecules/room-type-card'
export * from './ui/molecules/building-summary-card'
export * from './ui/molecules/headquarter-summary-card'
export * from './ui/molecules/headquarter-detail-modal'
export * from './ui/molecules/guest-compact-chip'
export * from './ui/molecules/bed-type-card'
export * from './ui/molecules/role-detail-modal'
