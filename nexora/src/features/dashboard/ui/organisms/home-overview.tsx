import type { NavId } from '../navigation'
import { StatGrid } from './stat-grid'
import { OccupancyChart } from './occupancy-chart'
import { RecentReservations } from './recent-reservations'
import { RecepcionesDashboardSection } from '../../../recepciones/ui/organisms/recepciones-dashboard-section'

export interface HomeOverviewProps {
  onNavigate?: (id: NavId) => void
}

export function HomeOverview({ onNavigate }: HomeOverviewProps) {
  return (
    <div className="space-y-10">
      <StatGrid />
      <OccupancyChart />
      <RecentReservations onNavigateToReservas={() => onNavigate?.('reservas')} />
      <RecepcionesDashboardSection onNavigateToRecepcion={() => onNavigate?.('recepcion')} />
    </div>
  )
}