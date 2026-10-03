import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { AuditScope, AuditSummaryResponse, AuditTabId, RoomAuditStatus } from '../domain/audit-types'
import { auditRepository } from '../infrastructure/api-audit-repository'

export interface AuditScopeContextType {
  activeTab: AuditTabId
  setActiveTab: (tab: AuditTabId) => void
  scope: AuditScope
  setScope: (newScope: Partial<AuditScope>) => void
  summary: AuditSummaryResponse | null
  summaryLoading: boolean
  summaryError: string | null
  refreshSummary: () => Promise<void>
  selectedRoomStatus: RoomAuditStatus
  setSelectedRoomStatus: (status: RoomAuditStatus) => void
  selectedGapsSection: 'unpriced' | 'inactive_rates'
  setSelectedGapsSection: (section: 'unpriced' | 'inactive_rates') => void
  // Métodos de navegación cruzada desde los KPIs:
  navigateToRoomStatus: (status: RoomAuditStatus) => void
  navigateToGapsSection: (section: 'unpriced' | 'inactive_rates') => void
  navigateToRates: () => void
}

const AuditScopeContext = createContext<AuditScopeContextType | null>(null)

export interface AuditScopeProviderProps {
  children: ReactNode
}

export function AuditScopeProvider({ children }: AuditScopeProviderProps) {
  const [activeTab, setActiveTab] = useState<AuditTabId>('resumen')
  const [scope, setScopeState] = useState<AuditScope>({
    headquarter_id: 'sede-central',
    subheadquarter_id: '',
    periodo: 'Mes en curso (2026)',
  })

  const [summary, setSummary] = useState<AuditSummaryResponse | null>(null)
  const [summaryLoading, setSummaryLoading] = useState<boolean>(true)
  const [summaryError, setSummaryError] = useState<string | null>(null)

  const [selectedRoomStatus, setSelectedRoomStatus] = useState<RoomAuditStatus>('disponibles')
  const [selectedGapsSection, setSelectedGapsSection] = useState<'unpriced' | 'inactive_rates'>(
    'unpriced',
  )

  const setScope = useCallback((newScope: Partial<AuditScope>) => {
    setScopeState((prev) => ({ ...prev, ...newScope }))
  }, [])

  const refreshSummary = useCallback(async () => {
    setSummaryLoading(true)
    setSummaryError(null)
    try {
      const data = await auditRepository.getSummary(scope)
      setSummary(data)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al consultar resumen de auditoría'
      setSummaryError(msg)
    } finally {
      setSummaryLoading(false)
    }
  }, [scope])

  useEffect(() => {
    void refreshSummary()
  }, [refreshSummary])

  // Accesos rápidos desde tarjetas KPI
  const navigateToRoomStatus = useCallback((status: RoomAuditStatus) => {
    setSelectedRoomStatus(status)
    setActiveTab('habitaciones')
  }, [])

  const navigateToGapsSection = useCallback((section: 'unpriced' | 'inactive_rates') => {
    setSelectedGapsSection(section)
    setActiveTab('brechas')
  }, [])

  const navigateToRates = useCallback(() => {
    setActiveTab('tarifas')
  }, [])

  const value: AuditScopeContextType = {
    activeTab,
    setActiveTab,
    scope,
    setScope,
    summary,
    summaryLoading,
    summaryError,
    refreshSummary,
    selectedRoomStatus,
    setSelectedRoomStatus,
    selectedGapsSection,
    setSelectedGapsSection,
    navigateToRoomStatus,
    navigateToGapsSection,
    navigateToRates,
  }

  return <AuditScopeContext.Provider value={value}>{children}</AuditScopeContext.Provider>
}

export function useAuditScope(): AuditScopeContextType {
  const context = useContext(AuditScopeContext)
  if (!context) {
    throw new Error('useAuditScope debe ser utilizado dentro de un AuditScopeProvider')
  }
  return context
}
