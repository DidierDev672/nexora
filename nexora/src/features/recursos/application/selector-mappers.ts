import type {
  ApiHeadquarter,
  ApiPermissionAssignment,
  ApiSubHeadquarter,
  ApiUser,
} from '../infrastructure/api-module-repository'

export interface SelectorOption {
  value: string
  label: string
}

export function toUserOption(user: ApiUser): SelectorOption {
  return { value: user.id, label: `${user.name} - ${user.email}` }
}

export function toHeadquarterOption(headquarter: ApiHeadquarter): SelectorOption {
  return { value: headquarter.id, label: headquarter.name }
}

export function toSubHeadquarterOption(subHeadquarter: ApiSubHeadquarter): SelectorOption {
  return { value: subHeadquarter.id, label: subHeadquarter.name }
}

export interface PermissionOptionContext {
  assignment: ApiPermissionAssignment
  userNames: ReadonlyMap<string, string>
  headquarterNames: ReadonlyMap<string, string>
  subHeadquarterNames: ReadonlyMap<string, string>
}

export function toPermissionOption(context: PermissionOptionContext): SelectorOption {
  const { assignment, userNames, headquarterNames, subHeadquarterNames } = context
  const userName = userNames.get(assignment.id_user) ?? assignment.id_user
  const headquarterName =
    headquarterNames.get(assignment.id_headquarters) ?? assignment.id_headquarters
  const subName =
    assignment.id_sub_headquarters != null
      ? subHeadquarterNames.get(assignment.id_sub_headquarters)
      : undefined

  const scope = subName ? `${headquarterName} · ${subName}` : headquarterName

  return {
    value: `${assignment.id_user}|${assignment.id_headquarters}|${
      assignment.id_sub_headquarters ?? 'sede'
    }`,
    label: `${userName} en ${scope}`,
  }
}