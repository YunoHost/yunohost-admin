import { toEntries } from '@/helpers/commons'
import type {
  BackupHookDataKeys,
  BackupHookKeys,
  BackupHooksList,
  BackupInfo,
} from '@/types/core/api'
import i18n from '@/i18n'

type BackupSystem = Record<
  BackupHookDataKeys | 'adminjs_group_configuration',
  {
    name: string
    value: string[]
    description: string
    size?: number
  }
>

export function formatBackupSystem(
  system: BackupHooksList['hooks'] | BackupInfo['system'],
) {
  const t = i18n.global.t
  const infos = (
    !Array.isArray(system)
      ? toEntries(system).map(([key, { size }]) => [key, size])
      : system.map((key) => [key])
  ) as [BackupHookKeys, number | undefined][]
  return infos.reduce((data, [key, size]) => {
    const hookKey = key.startsWith('conf_')
      ? 'adminjs_group_configuration'
      : (key as BackupHookDataKeys)
    if (hookKey in data) {
      data[hookKey].value.push(key)
      data[hookKey].description += ', ' + t('hook_' + key)
      if (size) data[hookKey].size! += size
    } else {
      data[hookKey] = {
        name: t('hook_' + hookKey),
        value: [key],
        description: t(hookKey === key ? `hook_${key}_desc` : 'hook_' + key),
        size,
      }
    }
    return data
  }, {} as BackupSystem)
}

export function parseBackupForm(selected: string[], system: BackupSystem) {
  const data = { apps: [], system: [] } as { apps: string[]; system: string[] }
  for (const key of selected) {
    if (key in system) {
      data.system.push(...system[key as keyof typeof system].value)
    } else {
      data.apps.push(key)
    }
  }

  if (!data.apps.length) delete data.apps
  if (!data.system.length) delete data.system

  return data
}
