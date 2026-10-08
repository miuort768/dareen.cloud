import { existsSync, readFileSync, writeFileSync } from 'fs';
import { createRequire } from 'module';
import { join } from 'path';

/**
 * Regenerates the `redirects` array in `vercel.json` from
 * `server/config/legacyImages.js` â€” the single source of truth for legacy image names.
 *
 * The Vercel frontend deploy never runs `server/index.js`, so the same alias map has to
 * exist in its own config; this script keeps the two provably in sync (and
 * `src/shared/components/ui/vercelLegacyRedirects.test.ts` fails the build if they drift).
 *
 * Usage: node scripts/gen-vercel-redirects.mjs
 */

const ROOT = process.cwd();
const require = createRequire(import.meta.url);
const { buildVercelImageRedirects } = require(join(ROOT, 'server/config/legacyImages.js'));

const target = join(ROOT, 'vercel.json');
const existing = existsSync(target) ? JSON.parse(readFileSync(target, 'utf8')) : {};

// Preserve every other key (framework overrides, headers, â€¦) â€” only redirects is owned
// by this script.
const config = { ...existing, redirects: buildVercelImageRedirects() };

// One redirect per line: readable diffs when a base name is added or re-versioned.
const body = config.redirects
  .map((r) => `    { "source": ${JSON.stringify(r.source)}, "destination": ${JSON.stringify(r.destination)}, "permanent": true }`)
  .join(',\n');

writeFileSync(target, `{\n  "redirects": [\n${body}\n  ]\n}\n`, 'utf8');
console.log(`âœ“ vercel.json â€” ${config.redirects.length} legacy image redirect(s)`);
