import { formatDistanceToNow } from 'date-fns/formatDistanceToNow'
import { format } from 'date-fns/format'

import { dateFnsLocale as locale } from '@/i18n/helpers'

export function distanceToNow(
  date: string | number,
  addSuffix = true,
  isTimestamp = false,
) {
  const tsOrDate = isTimestamp && typeof date === 'number' ? date * 1000 : date
  return formatDistanceToNow(new Date(tsOrDate), { addSuffix, locale })
}

export function readableDate(
  date: string | number,
  isTimestamp = false,
): string {
  const tsOrDate = isTimestamp && typeof date === 'number' ? date * 1000 : date
  return format(new Date(tsOrDate), 'PPPpp', { locale })
}
