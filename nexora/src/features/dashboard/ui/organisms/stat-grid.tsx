import type { ReactNode } from 'react'
import { MOCK_KPIS } from '../../infrastructure/mock-data'
import { type KpiIcon } from '../../domain/dashboard-types'
import { BedIcon, BuildingIcon, TrendingUpIcon, UsersIcon } from '../icons'
import { StatCard } from './stat-card'

const KPI_ICONS: Record<KpiIcon, ReactNode> = {
  rooms: <BedIcon className="size-5" />,
  guests: <UsersIcon className="size-5" />,
  sedes: <BuildingIcon className="size-5" />,
  occupancy: <TrendingUpIcon className="size-5" />,
}

export function StatGrid() {
  return (
    <section
      aria-label="Métricas clave"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {MOCK_KPIS.map((kpi, index) => (
        <StatCard
          key={kpi.id}
          icon={KPI_ICONS[kpi.icon]}
          label={kpi.label}
          value={kpi.value}
          change={kpi.change}
          delay={index * 80}
        />
      ))}
    </section>
  )
}