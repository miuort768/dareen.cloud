/**
 * Safe JSON-LD serialization for <script type="application/ld+json"> blocks.
 *
 * JSON.stringify does NOT escape "<" — any DB-sourced string (post title,
 * review text, settings value) containing "</script>" would break out of the
 * JSON-LD block and inject arbitrary markup/scripts into the document.
 * Escaping <, >, & and line separators keeps the output valid JSON while
 * neutralizing HTML/script-context breakout.
 */
export const safeJsonLd = (value: unknown): string =>
  JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
