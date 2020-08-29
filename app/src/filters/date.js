import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import format from 'date-fns/format'

import { dateFnsLocale as locale } from '@/i18n/helpers'

export function distanceToNow (dateStr, addSuffix = true) {
  return formatDistanceToNow(new Date(dateStr), { addSuffix, locale })
}

export function readableDate (dateStr) {
  return format(new Date(dateStr), 'PPPpp', { locale })
}
