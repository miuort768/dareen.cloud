import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it, expect } from 'vitest'
import {
  buildLegacyImageAliases,
  buildVercelImageRedirects,
} from '../../server/config/legacyImages'

describe('Vercel legacy image redirects', () => {
  it('has exactly the expected 27 alias pairs', () => {
    const map = buildLegacyImageAliases()
    expect(map.size).toBe(27)
  })

  it('vercel.json is in sync with the generator', () => {
    const vercel = JSON.parse(readFileSync(join(process.cwd(), 'vercel.json'), 'utf8')) as {
      redirects: { source: string; destination: string }[]
    }
    const redirects = buildVercelImageRedirects()
    expect(redirects.length).toBe(vercel.redirects.length)
    const m = new Map(vercel.redirects.map((r) => [r.source, r.destination]))
    for (const r of redirects) expect(m.get(r.source)).toBe(r.destination)
  })

  it('all destinations exist in public', () => {
    const pub = join(process.cwd(), 'public')
    const map = buildLegacyImageAliases()
    for (const d of map.values()) {
      expect(existsSync(join(pub, d.replace(/^\//, '')))).toBe(true)
    }
  })
})
