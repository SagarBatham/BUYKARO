function extractBearerToken(value) {
  if (!value) return ''

  const normalized = String(value).trim()
  if (!normalized) return ''

  const withoutBearer = normalized.replace(/^Bearer\s+/i, '').trim()
  const cookieMatch = withoutBearer.match(/token=([^;\s]+)/i)
  if (cookieMatch?.[1]) return decodeURIComponent(cookieMatch[1])
  return withoutBearer
}

module.exports = { extractBearerToken }
