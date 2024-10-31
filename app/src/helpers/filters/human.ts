export function humanSize(bytes: string | number) {
  const b = typeof bytes === 'string' ? parseFloat(bytes) : bytes
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) return 'n/a'
  const i = Math.floor(Math.log(b) / Math.log(1024))
  return (b / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i]
}

export function humanPermissionName(text: string) {
  return text
    .split('.')[1]
    .replace('_', ' ')
    .replace(/\w\S*/g, (part) => {
      return part.charAt(0).toUpperCase() + part.substr(1).toLowerCase()
    })
}
