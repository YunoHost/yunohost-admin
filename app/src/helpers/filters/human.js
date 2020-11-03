export function humanSize (bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) return 'n/a'
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i]
}


export function humanPermissionName (text) {
  return text.split('.')[1].replace('_', ' ').replace(/\w\S*/g, part => {
    return part.charAt(0).toUpperCase() + part.substr(1).toLowerCase()
  })
}
