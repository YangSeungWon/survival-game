/**
 * Locale-aware links for the in-game menu.
 *
 * The game is served at two URLs: Korean at "/" and English at "/en/".
 * pageHref keeps navigation within the current language, e.g. from /en/ the
 * Records button goes to /en/records.html, from / it goes to /records.html.
 */
export function pageHref(page: string): string {
    const enPrefix = typeof location !== 'undefined' && location.pathname.startsWith('/en');
    return `${enPrefix ? '/en/' : '/'}${page}`;
}
