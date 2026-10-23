import { useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { useReservasList } from '../application/use-reservas-list'
import { ReservasListaHeader } from './molecules/reservas-lista-header'
import { ReservasListaToolbar } from './molecules/reservas-lista-toolbar'
import { ReservasFeedbackBanner } from './molecules/reservas-feedback-banner'
import { ReservaDetalleModal } from './molecules/reserva-detalle-modal'
import { ReservasListContainer } from './organisms/reservas-list-container'

interface ReservasListaPageProps {
  onNuevaReserva?: () => void
}

export function ReservasListaPage({ onNuevaReserva }: ReservasListaPageProps) {
  const [selectedReservaId, setSelectedReservaId] = useState<string | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const {
    viewMode,
    setViewMode,
    visibleItems,
    loading,
    refreshing,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    hasMore,
    loadMore,
    feedback,
    clearFeedback,
    refetch,
    totalCount,
    filteredCount,
  } = useReservasList()

  const handleResetFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
  }

  const handleOpenDetail = (id: string) => {
    setSelectedReservaId(id)
    setIsDetailModalOpen(true)
  }

  const handleCloseDetail = () => {
    setIsDetailModalOpen(false)
    setSelectedReservaId(null)
  }

  return (
    <div className="space-y-6">
      {/* Header con psicología del usuario y animación slideIn */}
      <ReservasListaHeader onNuevaReserva={onNuevaReserva} />

      {/* Banner de feedback si hay avisos o respuestas del servidor */}
      <AnimatePresence>
        {feedback && feedback.message && (
          <ReservasFeedbackBanner
            feedback={feedback}
            onDismiss={clearFeedback}
          />
        )}
      </AnimatePresence>

      {/* Barra de herramientas: Búsqueda, filtros, recarga y switch cards/tabla */}
      <ReservasListaToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        refreshing={refreshing}
        onRefresh={refetch}
        totalCount={totalCount}
        filteredCount={filteredCount}
      />

      {/* Contenedor principal con scroll infinito para tarjetas o tabla */}
      <ReservasListContainer
        viewMode={viewMode}
        items={visibleItems}
        loading={loading}
        hasMore={hasMore}
        onLoadMore={loadMore}
        onResetFilters={handleResetFilters}
        onSelectReserva={handleOpenDetail}
      />

      {/* Modal para visualizar el detalle completo de la reserva (GET /reserve/{id}) */}
      <ReservaDetalleModal
        isOpen={isDetailModalOpen}
        reservaId={selectedReservaId}
        onClose={handleCloseDetail}
      />
    </div>
  )
}
