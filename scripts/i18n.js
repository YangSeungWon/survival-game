/**
 * Shared locale helpers for the static page generators (records / howto).
 *
 * URL scheme (SEO best practice — one URL per language):
 *   ko  → /records.html     /howto.html     /
 *   en  → /en/records.html  /en/howto.html  /en/
 *
 * Generated pages use absolute paths (/assets, /records.html, ...) so the same
 * markup works whether it is served from the root (ko) or /en/ (en).
 */
const SITE = 'https://survival.game.ysw.kr';

const LOCALES = [
    { code: 'ko', htmlLang: 'ko', dir: '' },
    { code: 'en', htmlLang: 'en', dir: 'en/' },
];

const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/** Absolute URL for a page in a given locale, e.g. altUrl('en','records.html'). */
function altUrl(code, file) {
    return `${SITE}/${code === 'ko' ? '' : 'en/'}${file}`;
}

/** Root-absolute path for a page in a given locale, e.g. localePath('en','records.html') → /en/records.html */
function localePath(code, file) {
    return `/${code === 'ko' ? '' : 'en/'}${file}`;
}

/** hreflang alternates block for a page (same logical file across locales). */
function hreflangTags(file) {
    return [
        `<link rel="alternate" hreflang="ko" href="${altUrl('ko', file)}">`,
        `<link rel="alternate" hreflang="en" href="${altUrl('en', file)}">`,
        `<link rel="alternate" hreflang="x-default" href="${altUrl('ko', file)}">`,
    ].join('\n');
}

/** A link to the same page in the other language. */
function langSwitchLink(currentCode, file) {
    const other = currentCode === 'ko' ? 'en' : 'ko';
    const label = other === 'ko' ? '한국어' : 'English';
    return `<a href="${localePath(other, file)}" rel="alternate" hreflang="${other}">🌐 ${label}</a>`;
}

module.exports = { SITE, LOCALES, esc, altUrl, localePath, hreflangTags, langSwitchLink };
