/**
 * Pre-renders records.json into static, SEO-friendly leaderboard pages, one per
 * language (ko → /records.html, en → /en/records.html), with hreflang and a
 * language switcher. Runs at build time (npm prebuild/prestart) so crawlers get
 * the full leaderboard as real HTML text; inline JS only enhances it.
 *
 * Every record is a boss-defeat clear. Records compare only within the same
 * *balance* version (gameplay numbers), not per commit — keep the map in sync
 * with src/utils/records.ts.
 */
const fs = require('fs');
const path = require('path');
const { SITE, LOCALES, esc, altUrl, localePath, hreflangTags, langSwitchLink } = require('./i18n');

const ROOT = path.resolve(__dirname, '..');
const FILE = 'records.html';

const BALANCE_VERSIONS = {
    'e5c7683ba8ff54439cd817b58bf14e7d380ad8eb': 'v1',
    'd1a2a255f204b1092a2c01de4baaaa5d1f7e006a': 'v1',
};
const shortCommit = (c) => (c ? String(c).slice(0, 7) : '');
const balanceVersion = (c) => (!c ? 'unknown' : BALANCE_VERSIONS[c] || `unversioned (${shortCommit(c)})`);

function formatTime(ms) {
    const t = Math.max(0, Math.floor(ms));
    return `${Math.floor(t / 60000)}:${String(Math.floor((t % 60000) / 1000)).padStart(2, '0')}.${String(t % 1000).padStart(3, '0')}`;
}
const latestDate = (rs) => rs.reduce((m, r) => (r.date && r.date > m ? r.date : m), '');

function groupByBalance(records) {
    const map = new Map();
    for (const r of records) {
        const k = balanceVersion(r.commit);
        if (!map.has(k)) map.set(k, []);
        map.get(k).push(r);
    }
    return [...map.entries()]
        .map(([version, records]) => ({ version, records }))
        .sort((a, b) => latestDate(b.records).localeCompare(latestDate(a.records)));
}

const PU_CAT = {
    'Piercing Projectile': 'atk', 'Melee Attack': 'atk', 'One shot Projectile': 'atk',
    'Stunning Projectile': 'atk', 'Farthest Beam Attack': 'atk',
    'Burning AoE': 'aoe', 'Freezing AoE': 'aoe', 'Poisoning AoE': 'aoe',
    'Move Speed': 'stat', 'Life Steal': 'stat', 'Defense Boost': 'stat',
    'Critical Hit Chance': 'stat', 'Health Boost': 'stat',
};
const catOf = (n) => PU_CAT[n] || 'other';

// Per-locale UI strings. Record data (times, names, numbers) is language-neutral.
const STR = {
    ko: {
        htmlTitle: 'Survival Game 리더보드 · 클리어 기록 보관소',
        metaDesc: (n, players) => `Survival Game(뱀파이어 서바이벌류 로그라이크) 보스 처치 클리어 기록 리더보드. 현재 ${n}개 기록, 플레이어 ${players.length}명. 밸런스 버전별 클리어 시간·빌드·최종 스탯 비교.`,
        h1: '🏆 Survival Game · 리더보드',
        play: '← 게임으로', howto: '📖 게임 방법',
        allClear: '✅ 모든 기록은 보스 처치 클리어입니다',
        fastest: '⏱ 빠른 클리어', longest: '🐢 오래 버틴',
        cap: '같은 밸런스끼리만 비교 유효',
        clears: '클리어', buildOrder: '파워업 순서', finalStats: '최종 스탯',
        notCaptured: '빌드 미기록 (아래 최종 스탯 참고)', build: '빌드', clearBadge: '✅ Clear',
        empty: '아직 기록이 없습니다.', footer: 'records.json 에서 자동 생성됨',
        clearTitle: '보스 처치 클리어', shotLabel: '스크린샷 보기',
    },
    en: {
        htmlTitle: 'Survival Game — Leaderboard | Clear-time records',
        metaDesc: (n, players) => `Boss-defeat clear leaderboard for Survival Game, a browser vampire-survivors-style roguelike. ${n} clears by ${players.length} players. Compare clear times, builds and final stats per balance version.`,
        h1: '🏆 Survival Game · Leaderboard',
        play: '← Play', howto: '📖 How to Play',
        allClear: '✅ Every record is a boss-defeat clear',
        fastest: '⏱ Fastest', longest: '🐢 Longest run',
        cap: 'comparable only within the same balance',
        clears: 'clears', buildOrder: 'Build order', finalStats: 'Final stats',
        notCaptured: 'build not captured (see final stats below)', build: 'Build', clearBadge: '✅ Clear',
        empty: 'No records yet.', footer: 'auto-generated from records.json',
        clearTitle: 'boss defeated', shotLabel: 'view screenshot',
    },
};

function renderBuildOrder(powerUps, t) {
    if (!powerUps || powerUps.length === 0) return `<p class="muted">${esc(t.notCaptured)}</p>`;
    const chips = powerUps.map((n, i) => `<span class="pu ${catOf(n)}"><b>${i + 1}</b>${esc(n)}</span>`).join('<span class="arrow">›</span>');
    return `<div class="chips">${chips}</div>`;
}

function buildSummary(r) {
    if (r.powerUps && r.powerUps.length) {
        const c = {};
        for (const p of r.powerUps) c[p] = (c[p] || 0) + 1;
        const top = Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([n, k]) => (k > 1 ? `${n}×${k}` : n));
        const extra = Object.keys(c).length - top.length;
        return esc(top.join(' · ') + (extra > 0 ? ` +${extra}` : ''));
    }
    const s = r.stats || {};
    return esc(`Speed ${s.moveSpeed} · LifeSteal ${s.lifeSteal}% · Def ${s.defense} · Crit ${s.critChance}%`);
}

function renderStats(s) {
    if (!s) return '';
    const badges = [`❤️ ${s.maxHealth}`, `🏃 ${s.moveSpeed}`, `🩸 ${s.lifeSteal}%`, `🛡️ ${s.defense}`, `🎯 ${s.critChance}%`]
        .map((b) => `<span class="stat">${b}</span>`).join('');
    const atk = (s.attacks || []).map((a) => `<span class="atkchip">${esc(a)}</span>`).join('');
    return `<div class="badges">${badges}</div>${atk ? `<div class="chips atks">${atk}</div>` : ''}`;
}

function renderCard(r, t) {
    const shot = r.screenshot
        ? `<button class="thumb-btn" data-full="${esc(r.screenshot)}" aria-label="${esc(t.shotLabel)}"><img class="thumb" loading="lazy" src="${esc(r.screenshot)}" alt="${esc(r.player)} clear screenshot"></button>`
        : '';
    const lvl = r.level !== 15 ? `<span class="lvl">L${esc(r.level)}</span>` : '';
    return `<article class="rec" data-time="${r.time}">
    <div class="rec-head">
      <span class="rank"></span>
      <span class="time">${esc(formatTime(r.time))}</span>
      <span class="player">${esc(r.player || '?')}</span>
      <span class="clear" title="${esc(t.clearTitle)}">${esc(t.clearBadge)}</span>
      ${lvl}
      <span class="ver" title="${esc(r.commit || '')}">@${esc(shortCommit(r.commit))}</span>
      <span class="summary">${buildSummary(r)}</span>
      <button class="toggle" aria-expanded="false">${esc(t.build)} ▾</button>
      ${shot}
    </div>
    <div class="rec-body" hidden>
      <h4>${esc(t.buildOrder)}</h4>
      ${renderBuildOrder(r.powerUps, t)}
      <h4>${esc(t.finalStats)}</h4>
      ${renderStats(r.stats)}
      ${r.note ? `<p class="note">📝 ${esc(r.note)}</p>` : ''}
    </div>
  </article>`;
}

function renderGroup(group, t) {
    const ranked = [...group.records].sort((a, b) => a.time - b.time);
    return `<section class="balance">
    <h2>⚖️ Balance ${esc(group.version)} <span class="count">· ${group.records.length} ${esc(t.clears)}</span></h2>
    <p class="cap">${esc(t.cap)}</p>
    <div class="cards">
${ranked.map((r) => renderCard(r, t)).join('\n')}
    </div>
  </section>`;
}

const CSS = `
  :root { color-scheme: dark; } * { box-sizing: border-box; }
  body { margin:0; background:#0a0a0a; color:#eee; font-family:"Noto Sans",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; line-height:1.5; }
  a { color:#66ccff; }
  header.top { padding:24px 20px 8px; text-align:center; }
  header.top h1 { margin:0 0 6px; font-size:clamp(24px,5vw,40px); color:#ffd700; }
  header.top p.intro { max-width:760px; margin:8px auto 0; color:#bbb; font-size:14px; }
  .nav { text-align:center; margin:14px 0 4px; }
  .nav a { display:inline-block; padding:8px 16px; margin:0 4px; background:#1a1a1a; border-radius:8px; text-decoration:none; font-weight:600; }
  .allclear { text-align:center; color:#9be29b; font-size:13px; margin:6px 0 0; }
  .controls { text-align:center; margin:16px 0 6px; }
  .controls button { font:inherit; cursor:pointer; padding:8px 16px; margin:0 4px; border:1px solid #333; border-radius:999px; background:#222; color:#ddd; }
  .controls button[aria-pressed="true"] { background:#ffd700; color:#000; border-color:#ffd700; font-weight:700; }
  main { max-width:1000px; margin:0 auto; padding:0 16px 60px; }
  section.balance { margin:26px 0; }
  section.balance h2 { color:#66ccff; border-bottom:2px solid #223; padding-bottom:6px; font-size:20px; margin-bottom:2px; }
  section.balance h2 .count { color:#888; font-weight:400; font-size:15px; }
  .cap { color:#777; font-size:12px; margin:0 0 12px; }
  .cards { display:flex; flex-direction:column; gap:8px; }
  .rec { background:#121212; border:1px solid #1e1e1e; border-radius:10px; overflow:hidden; }
  .rec:first-child { border-color:#6b5b12; box-shadow:inset 0 0 0 1px #4d4110; }
  .rec-head { display:flex; align-items:center; gap:10px; padding:10px 14px; flex-wrap:wrap; }
  .rank { font-weight:800; min-width:34px; color:#ffd700; }
  .time { font-variant-numeric:tabular-nums; font-weight:700; font-size:16px; }
  .player { background:#23324a; color:#cfe3ff; padding:2px 8px; border-radius:6px; font-weight:600; font-size:13px; }
  .clear { color:#7fdc7f; font-size:12px; } .lvl { color:#ffb15c; font-size:12px; font-weight:700; }
  .ver { color:#7aa; font-family:ui-monospace,monospace; font-size:11px; }
  .summary { color:#aaa; font-size:12px; flex:1 1 160px; min-width:120px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .toggle { font:inherit; font-size:12px; cursor:pointer; background:#262626; color:#ccc; border:1px solid #333; border-radius:6px; padding:3px 10px; }
  .thumb-btn { padding:0; border:0; background:none; cursor:zoom-in; }
  img.thumb { height:34px; width:56px; object-fit:cover; border-radius:4px; border:1px solid #333; display:block; }
  .rec-body { padding:4px 14px 14px; border-top:1px solid #1e1e1e; }
  .rec-body h4 { margin:12px 0 6px; color:#888; font-size:12px; text-transform:uppercase; letter-spacing:.04em; }
  .chips { display:flex; flex-wrap:wrap; gap:5px; align-items:center; }
  .pu { display:inline-flex; align-items:center; gap:5px; padding:3px 9px; border-radius:999px; font-size:12.5px; border:1px solid; }
  .pu b { font-size:10px; opacity:.7; }
  .pu.atk { background:#14203a; border-color:#2c4a7a; color:#bcd4ff; }
  .pu.aoe { background:#3a1e10; border-color:#7a4a2c; color:#ffd0b0; }
  .pu.stat { background:#14301a; border-color:#2c7a45; color:#b6ecc4; }
  .pu.other { background:#222; border-color:#444; color:#ccc; }
  .arrow { color:#444; font-size:12px; }
  .badges { display:flex; flex-wrap:wrap; gap:6px; }
  .stat { background:#1a1a1a; border:1px solid #2a2a2a; border-radius:6px; padding:3px 9px; font-size:13px; font-variant-numeric:tabular-nums; }
  .chips.atks { margin-top:6px; }
  .atkchip { background:#161616; border:1px solid #262626; border-radius:6px; padding:2px 8px; font-size:11.5px; color:#b9c6b9; font-family:ui-monospace,monospace; }
  .muted, .note { color:#888; font-size:12.5px; } .note { margin-top:10px; }
  #lightbox { position:fixed; inset:0; background:rgba(0,0,0,.94); display:none; align-items:center; justify-content:center; z-index:50; cursor:zoom-out; padding:20px; }
  #lightbox.open { display:flex; } #lightbox img { max-width:96vw; max-height:92vh; border-radius:6px; }
  footer { text-align:center; color:#666; font-size:12px; padding:24px; }`;

const SCRIPT = `
(function(){
  var order='fastest';
  function renumber(){
    document.querySelectorAll('section.balance .cards').forEach(function(box){
      var cards=Array.prototype.slice.call(box.querySelectorAll('.rec'));
      cards.sort(function(a,b){var d=(+a.dataset.time)-(+b.dataset.time);return order==='longest'?-d:d;});
      var medals=['🥇','🥈','🥉'];
      cards.forEach(function(c,i){box.appendChild(c);c.querySelector('.rank').textContent=medals[i]||('#'+(i+1));});
    });
  }
  function setCat(c){order=c;document.getElementById('cat-fastest').setAttribute('aria-pressed',c==='fastest');document.getElementById('cat-longest').setAttribute('aria-pressed',c==='longest');renumber();}
  document.getElementById('cat-fastest').addEventListener('click',function(){setCat('fastest');});
  document.getElementById('cat-longest').addEventListener('click',function(){setCat('longest');});
  renumber();
  document.querySelectorAll('.rec .toggle').forEach(function(btn){
    btn.addEventListener('click',function(){
      var body=btn.closest('.rec').querySelector('.rec-body');
      var open=body.hasAttribute('hidden');
      var label=btn.textContent.replace(/ [▾▴]$/,'');
      if(open){body.removeAttribute('hidden');btn.textContent=label+' ▴';btn.setAttribute('aria-expanded','true');}
      else{body.setAttribute('hidden','');btn.textContent=label+' ▾';btn.setAttribute('aria-expanded','false');}
    });
  });
  var lb=document.getElementById('lightbox'),lbImg=lb.querySelector('img');
  document.querySelectorAll('.thumb-btn').forEach(function(b){b.addEventListener('click',function(){lbImg.src=b.dataset.full;lb.classList.add('open');});});
  lb.addEventListener('click',function(){lb.classList.remove('open');lbImg.src='';});
})();`;

function renderPage(loc, records, groups, players) {
    const t = STR[loc.code];
    const sections = groups.map((g) => renderGroup(g, t)).join('\n');
    return `<!DOCTYPE html>
<html lang="${loc.htmlLang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(t.htmlTitle)}</title>
<meta name="description" content="${esc(t.metaDesc(records.length, players))}">
<link rel="canonical" href="${altUrl(loc.code, FILE)}">
${hreflangTags(FILE)}
<meta name="robots" content="index, follow">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(t.h1)}">
<meta property="og:description" content="${esc(t.metaDesc(records.length, players))}">
<meta property="og:url" content="${altUrl(loc.code, FILE)}">
<meta property="og:image" content="${SITE}/assets/start.webp">
<link rel="icon" type="image/png" href="/assets/player.png">
<style>${CSS}</style>
</head>
<body>
<header class="top">
  <h1>${esc(t.h1)}</h1>
  <div class="nav"><a href="${localePath(loc.code, '')}">${esc(t.play)}</a><a href="${localePath(loc.code, 'howto.html')}">${esc(t.howto)}</a>${langSwitchLink(loc.code, FILE)}</div>
  <p class="allclear">${esc(t.allClear)}</p>
</header>
<div class="controls" role="group">
  <button id="cat-fastest" aria-pressed="true">${esc(t.fastest)}</button>
  <button id="cat-longest" aria-pressed="false">${esc(t.longest)}</button>
</div>
<main>
${sections || `<p style="text-align:center;color:#888">${esc(t.empty)}</p>`}
</main>
<div id="lightbox" aria-hidden="true"><img alt="record screenshot"></div>
<footer>${esc(t.footer)}</footer>
<script>${SCRIPT}</script>
</body>
</html>
`;
}

function build() {
    const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'records.json'), 'utf8'));
    const records = data.records || [];
    const groups = groupByBalance(records);
    const players = [...new Set(records.map((r) => r.player).filter(Boolean))];

    for (const loc of LOCALES) {
        const out = path.join(ROOT, loc.dir, FILE);
        fs.mkdirSync(path.dirname(out), { recursive: true });
        fs.writeFileSync(out, renderPage(loc, records, groups, players));
    }
    console.log(`build-records: wrote ${LOCALES.map((l) => (l.dir || '') + FILE).join(', ')} (${records.length} records)`);
}

build();
