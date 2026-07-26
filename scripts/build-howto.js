/**
 * Pre-renders a static, SEO-friendly howto.html ("How to Play" / 게임 방법).
 *
 * Reads the game's own data files (PlayerAttackStats, EnemyStats,
 * StatusEffectConfig, PowerUpManager) so the guide tables stay in sync with the
 * actual balance instead of being hand-maintained. Runs at build time
 * (npm prebuild/prestart). Crawlers get the full guide as real HTML text.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://survival.game.ysw.kr';

const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/** Extracts a JS literal (array or object) from a TS source file and evaluates it. */
function extractLiteral(file, marker, open, close, sandbox = {}) {
    const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
    // Start after the '=' so a type annotation like `EnemyStat[]` isn't matched.
    const eq = src.indexOf('=', src.indexOf(marker));
    const start = src.indexOf(open, eq);
    let depth = 0, end = -1;
    for (let i = start; i < src.length; i++) {
        if (src[i] === open) depth++;
        else if (src[i] === close) { depth--; if (depth === 0) { end = i; break; } }
    }
    const text = src.slice(start, end + 1);
    const keys = Object.keys(sandbox);
    return new Function(...keys, 'return (' + text + ');')(...keys.map((k) => sandbox[k]));
}

// StatusEffectType is an enum referenced inside PlayerAttackStats literals.
const StatusEffectType = { BURN: 'burn', FREEZE: 'freeze', POISON: 'poison', STUN: 'stun' };

const attacks = extractLiteral('src/utils/PlayerAttackStats.ts', 'PlayerAttackStats:', '[', ']', { StatusEffectType });
const enemies = extractLiteral('src/utils/EnemyStats.ts', 'EnemyStats:', '[', ']');
const status = extractLiteral('src/utils/StatusEffectStats.ts', 'StatusEffectConfig', '{', '}');

// Power-up name + description pairs (regex avoids evaluating the apply() bodies).
function readPowerUps() {
    const src = fs.readFileSync(path.join(ROOT, 'src/utils/PowerUpManager.ts'), 'utf8');
    const re = /name:\s*'([^']+)',[\s\S]*?description:\s*'([^']+)'/g;
    const out = [];
    let m;
    while ((m = re.exec(src))) out.push({ name: m[1], description: m[2] });
    return out;
}
const powerUps = readPowerUps();

const humanEnemy = (t) => t.replace(/Enemy$/, '').replace(/([a-z])([A-Z])/g, '$1 $2').trim();

const attackRows = attacks.map((a) => `<tr>
    <td>${esc(a.name)}</td>
    <td>${a.attackPower}</td>
    <td>${a.attackSpeed}ms</td>
    <td>${a.attackRange}</td>
    <td>${a.statusEffect ? esc(a.statusEffect) : '—'}</td>
  </tr>`).join('\n');

const enemyRows = enemies
    .slice()
    .sort((a, b) => a.fromLevel - b.fromLevel)
    .map((e) => `<tr>
    <td>${esc(humanEnemy(e.type))}</td>
    <td>Lv ${e.fromLevel}–${e.toLevel}</td>
    <td>${e.health}</td>
    <td>${e.speed}</td>
    <td>${e.attackPower}</td>
    <td>${e.experiencePoint}</td>
  </tr>`).join('\n');

const puRows = powerUps.map((p) => `<tr><td>${esc(p.name)}</td><td>${esc(p.description)}</td></tr>`).join('\n');

const statusRows = [
    ['🔥 Burn (화상)', `틱마다 최대 체력의 ${status.burn.damagePercent}% 피해 · ${status.burn.damagePercent}% of max HP per tick`],
    ['☠️ Poison (독)', `틱마다 현재 체력의 ${status.poison.damagePercent}% 피해 · ${status.poison.damagePercent}% of current HP per tick`],
    ['❄️ Freeze (빙결)', `이동 속도 ${100 - status.freeze.multiplierPercent}% 감소 · slows movement to ${status.freeze.multiplierPercent}%`],
    ['⭐ Stun (기절)', `잠시 이동·공격 불가 · briefly disables movement and attacks`],
].map(([n, d]) => `<tr><td>${esc(n)}</td><td>${esc(d)}</td></tr>`).join('\n');

const intro = 'Survival Game(뱀파이어 서바이벌류 로그라이크) 플레이 방법 안내. 조작, 게임 흐름, 파워업, 적, 상태이상을 정리했습니다. How to play this browser vampire-survivors-style roguelike: controls, power-ups, enemies, and status effects.';

const html = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>게임 방법 · How to Play | Survival Game 공략</title>
<meta name="description" content="${esc(intro)}">
<link rel="canonical" href="${SITE}/howto.html">
<meta name="robots" content="index, follow">
<meta property="og:type" content="article">
<meta property="og:title" content="게임 방법 · How to Play — Survival Game">
<meta property="og:description" content="조작·파워업·적·상태이상 공략. Controls, power-ups, enemies, status effects.">
<meta property="og:url" content="${SITE}/howto.html">
<meta property="og:image" content="${SITE}/assets/start.webp">
<link rel="icon" type="image/png" href="assets/player.png">
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #0a0a0a; color: #eee;
    font-family: "Noto Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; line-height: 1.6; }
  a { color: #66ccff; }
  header.top { padding: 24px 20px 8px; text-align: center; }
  header.top h1 { margin: 0 0 6px; font-size: clamp(24px, 5vw, 40px); color: #ffd700; }
  header.top p.intro { max-width: 760px; margin: 8px auto 0; color: #bbb; font-size: 14px; }
  .nav { text-align: center; margin: 14px 0 4px; }
  .nav a { display: inline-block; padding: 8px 16px; margin: 0 4px; background: #1a1a1a; border-radius: 8px;
    text-decoration: none; font-weight: 600; }
  main { max-width: 900px; margin: 0 auto; padding: 8px 16px 60px; }
  section { margin: 28px 0; }
  h2 { color: #66ccff; border-bottom: 2px solid #223; padding-bottom: 6px; font-size: 21px; }
  ul.loop { padding-left: 20px; }
  ul.loop li { margin: 6px 0; }
  kbd { background: #222; border: 1px solid #444; border-bottom-width: 2px; border-radius: 5px;
    padding: 1px 7px; font-family: ui-monospace, monospace; font-size: 13px; }
  .table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; min-width: 520px; margin-top: 8px; }
  th, td { padding: 8px 10px; text-align: left; border-bottom: 1px solid #1c1c1c; }
  th { color: #999; font-weight: 600; }
  td:first-child { font-weight: 600; white-space: nowrap; }
  .callout { background: #14140a; border-left: 3px solid #ffd700; padding: 10px 14px; border-radius: 4px; }
  footer { text-align: center; color: #666; font-size: 12px; padding: 24px; }
</style>
</head>
<body>
<header class="top">
  <h1>📖 게임 방법 · How to Play</h1>
  <p class="intro">${esc(intro)}</p>
  <div class="nav"><a href="./">▶ 게임 시작 / Play</a><a href="records.html">🏆 Records</a></div>
</header>

<main>
  <section>
    <h2>🎯 목표 · Objective</h2>
    <p>끝없이 몰려오는 적을 처치하며 생존하고, <strong>레벨 15에서 등장하는 보스(체력 30,000)</strong>를 잡으면 <strong>승리(You Win!)</strong>합니다.</p>
    <p class="callout">Survive the endless waves, level up, and defeat the <strong>boss that appears at level 15</strong> to win.</p>
  </section>

  <section>
    <h2>🎮 조작 · Controls</h2>
    <ul class="loop">
      <li><strong>이동 / Move</strong>: 방향키 <kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd> (모바일은 화면 조이스틱 / on-screen joystick on mobile)</li>
      <li><strong>공격 / Attack</strong>: <strong>자동</strong> — 가장 가까운 적을 자동 조준해 공격합니다. Automatic, auto-aims the nearest enemy.</li>
      <li><strong>레벨업 선택 / Level-up</strong>: 숫자키 <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> 또는 클릭, 취소는 <kbd>Esc</kbd>.</li>
    </ul>
  </section>

  <section>
    <h2>🔄 게임 흐름 · Core Loop</h2>
    <ul class="loop">
      <li>적을 처치하면 <strong>경험치(XP)</strong>가 떨어집니다 → 밟아서 획득.</li>
      <li>XP가 차면 <strong>레벨업</strong> → 파워업 하나를 선택해 강해집니다.</li>
      <li>레벨이 오를수록 적이 더 자주, 더 세게 몰려옵니다.</li>
      <li>가끔 떨어지는 <strong>하트</strong>로 체력을 회복합니다.</li>
      <li><strong>레벨 15</strong>에서 보스 등장 → 처치하면 클리어.</li>
    </ul>
  </section>

  <section>
    <h2>⬆️ 파워업 · Power-Ups</h2>
    <div class="table-wrap"><table>
      <thead><tr><th>Power-Up</th><th>효과 · Effect</th></tr></thead>
      <tbody>
${puRows}
      </tbody>
    </table></div>
  </section>

  <section>
    <h2>💥 공격 · Attacks</h2>
    <div class="table-wrap"><table>
      <thead><tr><th>Attack</th><th>Power</th><th>Cooldown</th><th>Range</th><th>Effect</th></tr></thead>
      <tbody>
${attackRows}
      </tbody>
    </table></div>
  </section>

  <section>
    <h2>✨ 상태이상 · Status Effects</h2>
    <div class="table-wrap"><table>
      <thead><tr><th>Effect</th><th>설명 · Description</th></tr></thead>
      <tbody>
${statusRows}
      </tbody>
    </table></div>
  </section>

  <section>
    <h2>👾 적 · Enemies</h2>
    <div class="table-wrap"><table>
      <thead><tr><th>Enemy</th><th>Levels</th><th>HP</th><th>Speed</th><th>Atk</th><th>XP</th></tr></thead>
      <tbody>
${enemyRows}
      </tbody>
    </table></div>
  </section>

  <section>
    <h2>💡 팁 · Tips</h2>
    <ul class="loop">
      <li>계속 움직이며 적 무리를 피하세요. 자동 공격이 알아서 처리합니다.</li>
      <li>범위 공격(AoE)과 관통 투사체는 다수의 적에게 강력합니다.</li>
      <li>흡혈·방어·체력회복은 보스전 생존력을 크게 올립니다.</li>
      <li>독·화상 장판 위에 오래 서 있지 마세요.</li>
    </ul>
  </section>
</main>

<footer>게임 데이터에서 자동 생성됨 · Auto-generated from game data</footer>
</body>
</html>
`;

fs.writeFileSync(path.join(ROOT, 'howto.html'), html);
console.log(`build-howto: wrote howto.html (${powerUps.length} power-ups, ${attacks.length} attacks, ${enemies.length} enemies)`);
