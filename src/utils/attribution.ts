const ATTRIBUTION_KEY = 'lowticket_attribution'
const ATTRIBUTION_PARAMS = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
  'utm_id', 'fbclid', 'gclid', 'ttclid',
] as const

type Attribution = Partial<Record<(typeof ATTRIBUTION_PARAMS)[number], string>>

const readStoredAttribution = (): Attribution => {
  try {
    const raw = window.localStorage.getItem(ATTRIBUTION_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return {}
    
    // Sanitize to only known string params
    const sanitized: Attribution = {}
    ATTRIBUTION_PARAMS.forEach((param) => {
      if (typeof parsed[param] === 'string') {
        sanitized[param] = parsed[param]
      }
    })
    return sanitized
  } catch {
    return {}
  }
}

export function captureAttributionParams() {
  try {
    const current = new URLSearchParams(window.location.search)
    const attribution = readStoredAttribution()
    let changed = false

    ATTRIBUTION_PARAMS.forEach(param => {
      const value = current.get(param)
      if (value && typeof value === 'string') {
        attribution[param] = value
        changed = true
      }
    })

    if (changed) {
      // Build plain primitive key-value map before saving
      const payload: Record<string, string> = {}
      ATTRIBUTION_PARAMS.forEach(param => {
        const val = attribution[param]
        if (typeof val === 'string') {
          payload[param] = val
        }
      })
      window.localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(payload))
    }
  } catch {
    // A página continua funcional quando o navegador bloqueia armazenamento local.
  }
}

export function withAttributionParams(url: string) {
  if (!url) return ''

  try {
    const target = new URL(url, window.location.origin)
    const attribution = readStoredAttribution()
    Object.entries(attribution).forEach(([param, value]) => {
      if (value && !target.searchParams.has(param)) target.searchParams.set(param, value)
    })
    return target.toString()
  } catch {
    return url
  }
}
