import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HabitacionesHeader } from './molecules/habitaciones-header';
import { HabitacionDetallePanel } from './organisms/habitacion-detalle-panel';
import { HabitacionesListaTable } from './organisms/habitaciones-lista-table';
import { AsignarHuespedPage } from './asignar-huesped-page';
import { type HabitacionesViewMode } from './molecules/habitaciones-view-mode-toggle';
import type { RoomRow } from '../domain/habitacion-lista';

export function HabitacionesPage() {
  const [activeTab, setActiveTab] = useState<'lista' | 'registro'>('lista');
  const [viewMode, setViewMode] = useState<HabitacionesViewMode>('cards');
  const [selectedRoomForHuesped, setSelectedRoomForHuesped] =
    useState<RoomRow | null>(null);

  return (
    <div className="bg-canvas min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        <AnimatePresence mode="wait">
          {selectedRoomForHuesped ? (
            <motion.div
              key={`asignar-huesped-${selectedRoomForHuesped.id}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <AsignarHuespedPage
                room={selectedRoomForHuesped}
                onBack={() => setSelectedRoomForHuesped(null)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="habitaciones-main-view"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-8"
            >
              <HabitacionesHeader
                activeTab={activeTab}
                onTabChange={setActiveTab}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />

              <AnimatePresence mode="wait">
                {activeTab === 'lista' ? (
                  <motion.div
                    key="tab-habitaciones-lista"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                  >
                    <HabitacionesListaTable
                      onNewHabitacion={() => setActiveTab('registro')}
                      viewMode={viewMode}
                      onViewModeChange={setViewMode}
                      onSelectHabitacion={(room) =>
                        setSelectedRoomForHuesped(room)
                      }
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="tab-habitaciones-registro"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="mx-auto max-w-3xl"
                  >
                    <HabitacionDetallePanel />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
