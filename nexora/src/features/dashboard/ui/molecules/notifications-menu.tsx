import { BellIcon } from '../icons'
import { MenuPopover } from './menu-popover'

const SAMPLE_NOTIFICATIONS = [
  { id: 'n-01', title: 'Check-in completado en la Hab 214', time: 'hace 5 min' },
  { id: 'n-02', title: 'Nueva reserva en la Sede Centro', time: 'hace 22 min' },
  { id: 'n-03', title: 'Ocupación por encima del 90%', time: 'hace 1 h' },
] as const

export function NotificationsMenu() {
  return (
    <MenuPopover
      label="Notificaciones"
      align="right"
      renderTrigger={() => (
        <span className="relative">
          <BellIcon className="size-[18px]" />
          <span className="absolute -right-1.5 -top-1.5 grid size-4 place-items-center rounded-full bg-danger text-[10px] font-bold text-cream">
            {SAMPLE_NOTIFICATIONS.length}
          </span>
        </span>
      )}
      panelClassName="w-80"
    >
      <div className="flex items-center justify-between px-3 pt-2.5 pb-1">
        <p className="text-sm font-bold text-ink">Notificaciones</p>
        <span className="text-xs text-ink-muted">Hoy</span>
      </div>
      <ul className="max-h-72 overflow-y-auto">
        {SAMPLE_NOTIFICATIONS.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left outline-none transition-colors hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
              <span className="min-w-0">
                <span className="block text-sm text-ink">{item.title}</span>
                <span className="block text-xs text-ink-muted">{item.time}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <div className="border-t border-line px-3 py-2">
        <p className="text-center text-xs font-medium text-primary">Ver todas las notificaciones</p>
      </div>
    </MenuPopover>
  )
}