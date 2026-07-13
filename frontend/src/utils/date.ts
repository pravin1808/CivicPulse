export const formatDateTime = (value: string | undefined) => {
  if (!value) {
    return '—'
  }

  return new Date(value).toLocaleString()
}
