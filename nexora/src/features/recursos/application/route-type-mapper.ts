import type { ModuleRouteType } from '../infrastructure/api-module-repository'

export interface RouteTypeOption {
  value: string
  label: string
}

export function toRouteTypeOption(item: ModuleRouteType): RouteTypeOption {
  return {
    value: item.type_path,
    label: item.type_component,
  }
}