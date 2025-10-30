const ASSET_SCHEME = 'asset://'

function addLeadingSlash(path: string) {
  if (path.startsWith('/')) {
    return path
  }
  return `/${path}`
}

function normalizeSlashes(path: string) {
  return path.replace(/\\/g, '/').replace(/\/{2,}/g, '/')
}

export function resolveAssetUrl(rawValue: unknown, fallback = ''): string {
  if (typeof rawValue !== 'string') {
    return fallback
  }

  const value = rawValue.trim()
  if (!value) {
    return fallback
  }

  if (value.startsWith(ASSET_SCHEME)) {
    const assetPath = value.slice(ASSET_SCHEME.length).trim()
    if (!assetPath) {
      return fallback
    }
    return normalizeSlashes(addLeadingSlash(`assets/${assetPath}`))
  }

  if (/^https?:\/\//i.test(value) || value.startsWith('//')) {
    return value
  }

  return normalizeSlashes(addLeadingSlash(value))
}
