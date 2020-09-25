import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import format from 'date-fns/format'

import { dateFnsLocale as locale } from '@/i18n/helpers'

export function distanceToNow (date, addSuffix = true, isTimestamp = false) {
  return formatDistanceToNow(
    new Date(isTimestamp ? date * 1000 : date),
    { addSuffix, locale }
  )
}

export function readableDate (date, isTimestamp = false) {
  return format(
    new Date(isTimestamp ? date * 1000 : date),
    'PPPpp',
    { locale }
  )
}
