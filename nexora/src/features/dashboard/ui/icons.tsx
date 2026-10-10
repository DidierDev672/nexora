import type { ReactNode } from 'react'

export interface IconProps {
  className?: string
}

function BaseSvg({ className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

function MenuIcon({ className }: IconProps) {
  return (
    <BaseSvg className={className}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </BaseSvg>
  )
}

function CloseIcon({ className }: IconProps) {
  return (
    <BaseSvg className={className}>
      <path d="M18 6 6 18M6 6l12 12" />
    </BaseSvg>
  )
}

function HomeIcon({ className }: IconProps) {
  return (
    <BaseSvg className={className}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21a1 1 0 0 0 1 1h4v-7h4v7h4a1 1 0 0 0 1-1V9.5" />
    </BaseSvg>
  )
}

function BuildingIcon({ className }: IconProps) {
  return (
    <BaseSvg className={className}>
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4M10 10h4M10 14h4M10 18h4" />
    </BaseSvg>
  )
}

function BedIcon({ className }: IconProps) {
  return (
    <BaseSvg className={className}>
      <path d="M2 4v16" />
      <path d="M2 8h18a2 2 0 0 1 2 2v10" />
      <path d="M2 17h20" />
      <path d="M6 8v9" />
    </BaseSvg>
  )
}

function SearchIcon({ className }: IconProps) {
  return (
    <BaseSvg className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.35-4.35" />
    </BaseSvg>
  )
}

function BellIcon({ className }: IconProps) {
  return (
    <BaseSvg className={className}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </BaseSvg>
  )
}

function SunIcon({ className }: IconProps) {
  return (
    <BaseSvg className={className}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </BaseSvg>
  )
}

function MoonIcon({ className }: IconProps) {
  return (
    <BaseSvg className={className}>
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </BaseSvg>
  )
}

function ChevronDownIcon({ className }: IconProps) {
  return (
    <BaseSvg className={className}>
      <path d="m6 9 6 6 6-6" />
    </BaseSvg>
  )
}

function ChevronRightIcon({ className }: IconProps) {
  return (
    <BaseSvg className={className}>
      <path d="m9 18 6-6-6-6" />
    </BaseSvg>
  )
}

function UserIcon({ className }: IconProps) {
  return (
    <BaseSvg className={className}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </BaseSvg>
  )
}

function LogOutIcon({ className }: IconProps) {
  return (
    <BaseSvg className={className}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </BaseSvg>
  )
}

function SettingsIcon({ className }: IconProps) {
  return (
    <BaseSvg className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </BaseSvg>
  )
}

function ClockIcon({ className }: IconProps) {
  return (
    <BaseSvg className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </BaseSvg>
  )
}

function TrendingUpIcon({ className }: IconProps) {
  return (
    <BaseSvg className={className}>
      <path d="m22 7-8.5 8.5-5-5L2 17" />
      <path d="M16 7h6v6" />
    </BaseSvg>
  )
}

function TrendingDownIcon({ className }: IconProps) {
  return (
    <BaseSvg className={className}>
      <path d="M22 17l-8.5-8.5-5 5L2 7" />
      <path d="M16 17h6v-6" />
    </BaseSvg>
  )
}

function UsersIcon({ className }: IconProps) {
  return (
    <BaseSvg className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </BaseSvg>
  )
}

function PaletteIcon({ className }: IconProps) {
  return (
    <BaseSvg className={className}>
      <circle cx="13.5" cy="6.5" r=".5" />
      <circle cx="17.5" cy="10.5" r=".5" />
      <circle cx="8.5" cy="7.5" r=".5" />
      <circle cx="6.5" cy="12.5" r=".5" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2Z" />
    </BaseSvg>
  )
}

function ShieldIcon({ className }: IconProps) {
  return (
    <BaseSvg className={className}>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z" />
      <path d="m9 12 2 2 4-4" />
    </BaseSvg>
  )
}

function CubeIcon({ className }: IconProps) {
  return (
    <BaseSvg className={className}>
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </BaseSvg>
  )
}

function SparklesIcon({ className }: IconProps) {
  return (
    <BaseSvg className={className}>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
      <path d="M20 3v4M22 5h-4M4 17v2M5 18H3" />
    </BaseSvg>
  )
}

function CalendarIcon({ className }: IconProps) {
  return (
    <BaseSvg className={className}>
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
      <path d="m9 16 2 2 4-4" />
    </BaseSvg>
  )
}

function RefreshIcon({ className }: IconProps) {
  return (
    <BaseSvg className={className}>
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
      <path d="M3 21v-5h5" />
    </BaseSvg>
  )
}

function AlertTriangleIcon({ className }: IconProps) {
  return (
    <BaseSvg className={className}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </BaseSvg>
  )
}

function InfoIcon({ className }: IconProps) {
  return (
    <BaseSvg className={className}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </BaseSvg>
  )
}

function CheckCircleIcon({ className }: IconProps) {
  return (
    <BaseSvg className={className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </BaseSvg>
  )
}

function EyeIcon({ className }: IconProps) {
  return (
    <BaseSvg className={className}>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </BaseSvg>
  )
}

function ConciergeBellIcon({ className }: IconProps) {
  return (
    <BaseSvg className={className}>
      <path d="M2 18a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2H2v-2Z" />
      <path d="M20 16a8 8 0 1 0-16 0" />
      <path d="M12 4v4" />
      <path d="M10 4h4" />
    </BaseSvg>
  )
}

function TagIcon({ className }: IconProps) {
  return (
    <BaseSvg className={className}>
      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
      <path d="M7 7h.01" />
    </BaseSvg>
  )
}

function ClipboardCheckIcon({ className }: IconProps) {
  return (
    <BaseSvg className={className}>
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="m9 14 2 2 4-4" />
    </BaseSvg>
  )
}

function UtensilsIcon({ className }: IconProps) {
  return (
    <BaseSvg className={className}>
      <path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2" />
      <path d="M15 2v18" />
      <path d="M7 2h2a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7v7" />
    </BaseSvg>
  )
}

export {
  TagIcon,
  AlertTriangleIcon,
  BellIcon,
  BedIcon,
  BuildingIcon,
  CalendarIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClipboardCheckIcon,
  ClockIcon,
  CloseIcon,
  ConciergeBellIcon,
  CubeIcon,
  EyeIcon,
  HomeIcon,
  InfoIcon,
  LogOutIcon,
  MenuIcon,
  MoonIcon,
  PaletteIcon,
  RefreshIcon,
  SearchIcon,
  SettingsIcon,
  ShieldIcon,
  SparklesIcon,
  SunIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  UserIcon,
  UsersIcon,
  UtensilsIcon,
}