/**
 * Pre-renders records.json into a static, SEO-friendly records.html.
 *
 * Runs at build time (npm prebuild/prestart) so crawlers see the full
 * leaderboard as real HTML text without executing any JS. A small inline
 * script only enhances it (category re-sort + screenshot lightbox).
 *
 * Records are only comparable within the same *balance* version — which
 * changes when the gameplay numbers change, NOT on every commit. Keep the
 * commit -> version map below in sync with src/utils/records.ts.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://survival.game.ysw.kr';

const BALANCE_VERSIONS = {
    'e5c7683ba8ff54439cd817b58bf14e7d380ad8eb': 'v1',
    'd1a2a255f204b1092a2c01de4baaaa5d1f7e006a': 'v1',
};

const shortCommit = (c) => (c ? String(c).slice(0, 7) : '');
const balanceVersion = (c) => (!c ? 'unknown' : BALANCE_VERSIONS[c] || `unversioned (${shortCommit(c)})`);

function formatTime(ms) {
    const t = Math.max(0, Math.floor(ms));
    const m = Math.floor(t / 60000);
    const s = Math.floor((t % 60000) / 1000);
    const mmm = t % 1000;
    return `${m}:${String(s).padStart(2, '0')}.${String(mmm).padStart(3, '0')}`;
}

function formatCondition(r) {
    if (r.powerUps && r.powerUps.length > 0) return r.powerUps.join(', ');
    const s = r.stats;
    if (!s) return 'No power-ups';
    const parts = [
        `HP ${s.maxHealth}`, `Speed ${s.moveSpeed}`, `LifeSteal ${s.lifeSteal}%`,
        `Def ${s.defense}`, `Crit ${s.critChance}%`,
    ];
    if (s.attacks && s.attacks.length) parts.push(`Attacks: ${s.attacks.join(' / ')}`);
    return parts.join(', ');
}

function latestDate(records) {
    return records.reduce((max, r) => (r.date && r.date > max ? r.date : max), '');
}

function groupByBalance(records) {
    const map = new Map();
    for (const r of records) {
        const key = balanceVersion(r.commit);
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(r);
    }
    return [...map.entries()]
        .map(([version, records]) => ({ version, records }))
        .sort((a, b) => latestDate(b.records).localeCompare(latestDate(a.records)));
}

const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

function medal(i) {
    return i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
}

function renderRow(r) {
    const shot = r.screenshot
        ? `<button class="thumb-btn" data-full="${esc(r.screenshot)}" aria-label="스크린샷 보기"><img class="thumb" loading="lazy" src="${esc(r.screenshot)}" alt="${esc(r.player)} 기록 스크린샷"></button>`
        : '<span class="noshot">—</span>';
    // data-time lets the client-side category toggle re-sort without a re-fetch.
    return `<tr data-time="${r.time}">
      <td class="rank"></td>
      <td class="time">${esc(formatTime(r.time))}</td>
      <td class="player">${esc(r.player || '?')}</td>
      <td class="lvl">L${esc(r.level)}</td>
      <td class="commit" title="${esc(r.commit || '')}">@${esc(shortCommit(r.commit))}</td>
      <td class="cond">${esc(formatCondition(r))}</td>
      <td class="date">${esc(r.date || '')}</td>
      <td class="shot">${shot}</td>
    </tr>`;
}

function renderGroup(group) {
    // Static content is rendered fastest-first (the default category).
    const ranked = [...group.records].sort((a, b) => a.time - b.time);
    const rows = ranked.map(renderRow).join('\n');
    return `<section class="balance">
    <h2>Balance ${esc(group.version)} <span class="count">· ${group.records.length} clears</span></h2>
    <div class="table-wrap">
      <table class="board">
        <thead><tr>
          <th>#</th><th>Time</th><th>Player</th><th>Lv</th><th>Build</th><th>Cond.</th><th>Date</th><th>📷</th>
        </tr></thead>
        <tbody>
${rows}
        </tbody>
      </table>
    </div>
  </section>`;
}

function build() {
    const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'records.json'), 'utf8'));
    const records = data.records || [];
    const groups = groupByBalance(records);
    const players = [...new Set(records.map((r) => r.player).filter(Boolean))];

    const intro =
        `Survival Game(뱀파이어 서바이벌류 로그라이크) 클리어 기록 리더보드입니다. ` +
        `현재 ${records.length}개 기록, 플레이어 ${players.length}명(${players.join(', ')}). ` +
        `밸런스 버전별로 최단 클리어 시간과 빌드를 비교하세요. ` +
        `Clear-time leaderboard for a browser vampire-survivors-style roguelike — fastest clears, builds, and screenshots per balance version.`;

    const sections = groups.map(renderGroup).join('\n');

    const html = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Survival Game 리더보드 · Leaderboard | 클리어 기록 보관소</title>
<meta name="description" content="${esc(intro).slice(0, 300)}">
<link rel="canonical" href="${SITE}/records.html">
<meta name="robots" content="index, follow">
<meta property="og:type" content="website">
<meta property="og:title" content="Survival Game 리더보드 · Leaderboard">
<meta property="og:description" content="Survival Game 클리어 기록 보관소 — 밸런스 버전별 최단 클리어 시간·빌드·스크린샷.">
<meta property="og:url" content="${SITE}/records.html">
<meta property="og:image" content="${SITE}/assets/start.webp">
<link rel="icon" type="image/png" href="assets/player.png">
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #0a0a0a; color: #eee;
    font-family: "Noto Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; line-height: 1.5; }
  a { color: #66ccff; }
  header.top { padding: 24px 20px 8px; text-align: center; }
  header.top h1 { margin: 0 0 6px; font-size: clamp(24px, 5vw, 40px); color: #ffd700; }
  header.top p.intro { max-width: 760px; margin: 8px auto 0; color: #bbb; font-size: 14px; }
  .nav { text-align: center; margin: 14px 0 4px; }
  .nav a { display: inline-block; padding: 8px 16px; background: #1a1a1a; border-radius: 8px;
    text-decoration: none; font-weight: 600; }
  .controls { text-align: center; margin: 18px 0 6px; }
  .controls button { font: inherit; cursor: pointer; padding: 8px 16px; margin: 0 4px;
    border: 1px solid #333; border-radius: 999px; background: #222; color: #ddd; }
  .controls button[aria-pressed="true"] { background: #ffd700; color: #000; border-color: #ffd700; font-weight: 700; }
  main { max-width: 1100px; margin: 0 auto; padding: 0 16px 60px; }
  section.balance { margin: 28px 0; }
  section.balance h2 { color: #66ccff; border-bottom: 2px solid #223; padding-bottom: 6px; font-size: 20px; }
  section.balance h2 .count { color: #888; font-weight: 400; font-size: 15px; }
  .table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  table.board { width: 100%; border-collapse: collapse; font-size: 14px; min-width: 720px; }
  table.board th, table.board td { padding: 8px 10px; text-align: left; border-bottom: 1px solid #1c1c1c; white-space: nowrap; }
  table.board th { color: #999; font-weight: 600; position: sticky; top: 0; background: #0a0a0a; }
  table.board td.cond { white-space: normal; min-width: 260px; color: #cfcfcf; font-size: 13px; }
  table.board tbody tr:first-child { color: #ffd700; }
  td.time { font-variant-numeric: tabular-nums; font-weight: 700; }
  td.commit { color: #8aa; font-family: ui-monospace, monospace; font-size: 12px; }
  td.date { color: #888; font-size: 12px; }
  img.thumb { height: 40px; width: 64px; object-fit: cover; border-radius: 4px; border: 1px solid #333; display: block; }
  .thumb-btn { padding: 0; border: 0; background: none; cursor: zoom-in; }
  .noshot { color: #555; }
  #lightbox { position: fixed; inset: 0; background: rgba(0,0,0,.94); display: none;
    align-items: center; justify-content: center; z-index: 50; cursor: zoom-out; padding: 20px; }
  #lightbox.open { display: flex; }
  #lightbox img { max-width: 96vw; max-height: 92vh; border-radius: 6px; }
  footer { text-align: center; color: #666; font-size: 12px; padding: 24px; }
</style>
</head>
<body>
<header class="top">
  <h1>🏆 Survival Game · Leaderboard</h1>
  <p class="intro">${esc(intro)}</p>
  <div class="nav"><a href="./">← 게임으로 / Play</a></div>
</header>

<div class="controls" role="group" aria-label="정렬 기준">
  <button id="cat-fastest" aria-pressed="true">⏱ 최단 클리어 · Fastest</button>
  <button id="cat-longest" aria-pressed="false">🐢 최장 생존 · Longest</button>
</div>

<main>
${sections || '<p style="text-align:center;color:#888">아직 기록이 없습니다.</p>'}
</main>

<div id="lightbox" aria-hidden="true"><img alt="record screenshot"></div>

<footer>records.json 에서 자동 생성됨 · 밸런스 버전별로만 비교 유효</footer>

<script>
(function () {
  // Rank numbering + category toggle (re-sort rows within each table by data-time).
  var order = 'fastest';
  function renumber() {
    document.querySelectorAll('table.board tbody').forEach(function (tb) {
      var rows = Array.prototype.slice.call(tb.querySelectorAll('tr'));
      rows.sort(function (a, b) {
        var d = (+a.dataset.time) - (+b.dataset.time);
        return order === 'longest' ? -d : d;
      });
      rows.forEach(function (r, i) {
        tb.appendChild(r);
        var medals = ['🥇', '🥈', '🥉'];
        r.querySelector('.rank').textContent = medals[i] || ('#' + (i + 1));
        r.style.color = i === 0 ? '#ffd700' : '';
      });
    });
  }
  function setCat(c) {
    order = c;
    document.getElementById('cat-fastest').setAttribute('aria-pressed', c === 'fastest');
    document.getElementById('cat-longest').setAttribute('aria-pressed', c === 'longest');
    renumber();
  }
  document.getElementById('cat-fastest').addEventListener('click', function () { setCat('fastest'); });
  document.getElementById('cat-longest').addEventListener('click', function () { setCat('longest'); });
  renumber();

  // Screenshot lightbox
  var lb = document.getElementById('lightbox');
  var lbImg = lb.querySelector('img');
  document.querySelectorAll('.thumb-btn').forEach(function (b) {
    b.addEventListener('click', function () { lbImg.src = b.dataset.full; lb.classList.add('open'); });
  });
  lb.addEventListener('click', function () { lb.classList.remove('open'); lbImg.src = ''; });
})();
</script>
</body>
</html>
`;

    fs.writeFileSync(path.join(ROOT, 'records.html'), html);
    console.log(`build-records: wrote records.html (${records.length} records, ${groups.length} balance version(s))`);
}

build();
