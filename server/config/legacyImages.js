/**
 * Legacy public-image filenames â†’ their current `.v2` replacements.
 *
 * The public images were recompressed and renamed with a `.v2` suffix to bust the
 * one-year immutable cache (`express.static` serves `max-age=1y, immutable`), but those
 * old names are baked into things that live outside this repo's source:
 *   - `BlogPost.coverImage` values seeded before the rename (rendered as `<img src>`),
 *   - committed `.webp`/`.avif` artifacts that old bundles and cached markup still ask for,
 *   - OG/Twitter images shared on social platforms before the rename.
 *
 * Both hosting targets must answer them:
 *   - Railway (this server) â†’ the redirect middleware in `server/index.js`,
 *   - Vercel (static frontend, `vercel --prod`) â†’ `vercel.json` `redirects`.
 *
 * `originalExt` is the raster extension the asset actually shipped as (`.jpeg` never
 * existed in this repo, so it gets no alias). Every `.webp`/`.avif` destination exists
 * because `scripts/convert-webp.mjs` generates both formats for every public raster, and
 * `src/test/vercelLegacyRedirects.test.ts` fails the build if a
 * destination is missing or if `vercel.json` drifts from this map.
 */

const LEGACY_IMAGE_ASSETS = [
    { base: '404', originalExt: 'png' },
    { base: 'login1', originalExt: 'png' },
    { base: 'loginphone', originalExt: 'png' },
    { base: 'dareen8', originalExt: 'png' },
    { base: 'hero-child', originalExt: 'png' },
    { base: 'dareen_books_portal_v3', originalExt: 'png' },
    { base: 'chat-avatar', originalExt: 'jpg' },
    { base: 'dareen_logo_new', originalExt: 'jpg' },
    { base: 'logo', originalExt: 'png' },
];

const LEGACY_IMAGE_VERSION = 'v2';

// `.webp`/`.avif` were committed build artifacts before the rename, so cached bundles can
// still request them by their old names.
const GENERATED_EXTENSIONS = ['webp', 'avif'];

/**
 * @returns {Map<string, string>} old public path â†’ current public path
 */
function buildLegacyImageAliases() {
    const aliases = new Map();
    for (const { base, originalExt } of LEGACY_IMAGE_ASSETS) {
        for (const ext of [originalExt, ...GENERATED_EXTENSIONS]) {
            aliases.set(`/${base}.${ext}`, `/${base}.${LEGACY_IMAGE_VERSION}.${ext}`);
        }
    }
    return aliases;
}

/**
 * Vercel `redirects` entries, shaped for `vercel.json`.
 * @returns {{ source: string, destination: string, permanent: true }[]}
 */
function buildVercelImageRedirects() {
    return [...buildLegacyImageAliases()].map(([source, destination]) => ({
        source,
        destination,
        permanent: true,
    }));
}

module.exports = {
    LEGACY_IMAGE_ASSETS,
    GENERATED_EXTENSIONS,
    buildLegacyImageAliases,
    buildVercelImageRedirects,
};
