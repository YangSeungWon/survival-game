/**
 * Pre-renders a static, SEO-friendly "How to Play" guide, one page per language
 * (ko → /howto.html, en → /en/howto.html), with hreflang and a language
 * switcher. Tables are read from the game's own data files so they never drift
 * from balance. Runs at build time (npm prebuild/prestart).
 */
const fs = require('fs');
const path = require('path');
const { SITE, LOCALES, esc, altUrl, localePath, hreflangTags, langSwitchLink } = require('./i18n');

const ROOT = path.resolve(__dirname, '..');
const FILE = 'howto.html';

function extractLiteral(file, marker, open, close, sandbox = {}) {
    const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
    const eq = src.indexOf('=', src.indexOf(marker));
    const start = src.indexOf(open, eq);
    let depth = 0, end = -1;
    for (let i = start; i < src.length; i++) {
        if (src[i] === open) depth++;
        else if (src[i] === close) { depth--; if (depth === 0) { end = i; break; } }
    }
    const keys = Object.keys(sandbox);
    return new Function(...keys, 'return (' + src.slice(start, end + 1) + ');')(...keys.map((k) => sandbox[k]));
}

const StatusEffectType = { BURN: 'burn', FREEZE: 'freeze', POISON: 'poison', STUN: 'stun' };
const attacks = extractLiteral('src/utils/PlayerAttackStats.ts', 'PlayerAttackStats:', '[', ']', { StatusEffectType });
const enemies = extractLiteral('src/utils/EnemyStats.ts', 'EnemyStats:', '[', ']');
const status = extractLiteral('src/utils/StatusEffectStats.ts', 'StatusEffectConfig', '{', '}');

function readPowerUps() {
    const src = fs.readFileSync(path.join(ROOT, 'src/utils/PowerUpManager.ts'), 'utf8');
    const re = /name:\s*'([^']+)',[\s\S]*?description:\s*'([^']+)'/g;
    const out = [];
    let m;
    while ((m = re.exec(src))) out.push({ name: m[1], en: m[2] });
    return out;
}
const powerUps = readPowerUps();

// Korean translations for the code's English power-up descriptions.
const PU_KO = {
    'Health Boost': '체력 회복량 +500', 'Move Speed': '이동 속도 +50',
    'Life Steal': '입힌 피해의 5%만큼 체력 회복', 'Defense Boost': '방어력 +100',
    'Critical Hit Chance': '치명타 확률 +20%', 'Piercing Projectile': '관통 투사체 추가',
    'Melee Attack': '근접 공격 추가', 'Burning AoE': '화상 장판 추가',
    'Freezing AoE': '빙결 장판 추가', 'Poisoning AoE': '독 장판 추가',
    'Stunning Projectile': '기절 투사체 추가', 'One shot Projectile': '원샷(고데미지) 투사체 추가',
    'Farthest Beam Attack': '사거리 내 가장 먼 적에게 빔 발사',
};

const humanEnemy = (t) => t.replace(/Enemy$/, '').replace(/([a-z])([A-Z])/g, '$1 $2').trim();

const STR = {
    ko: {
        htmlTitle: '게임 방법 · Survival Game 공략',
        metaDesc: 'Survival Game(뱀파이어 서바이벌류 로그라이크) 플레이 방법 — 조작, 게임 흐름, 파워업, 공격, 상태이상, 적 정리.',
        h1: '📖 게임 방법',
        intro: '조작·게임 흐름·파워업·적·상태이상을 정리했습니다. 처음이라면 여기부터 읽어보세요.',
        play: '▶ 게임 시작', records: '🏆 리더보드',
        objective: '🎯 목표', controls: '🎮 조작', loop: '🔄 게임 흐름',
        powerups: '⬆️ 파워업', attacksH: '💥 공격', statusH: '✨ 상태이상', enemiesH: '👾 적', tips: '💡 팁',
        objectiveP: '끝없이 몰려오는 적을 처치하며 생존하고, <strong>레벨 15에서 등장하는 보스(체력 30,000)</strong>를 잡으면 <strong>승리(You Win!)</strong>합니다.',
        controlsL: [
            '<strong>이동</strong>: 방향키 <kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd> (모바일은 화면 조이스틱)',
            '<strong>공격</strong>: <strong>자동</strong> — 가장 가까운 적을 자동 조준해 공격합니다.',
            '<strong>레벨업 선택</strong>: 숫자키 <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> 또는 클릭, 취소는 <kbd>Esc</kbd>.',
        ],
        loopL: [
            '적을 처치하면 <strong>경험치(XP)</strong>가 떨어집니다 → 밟아서 획득.',
            'XP가 차면 <strong>레벨업</strong> → 파워업 하나를 선택해 강해집니다.',
            '레벨이 오를수록 적이 더 자주, 더 세게 몰려옵니다.',
            '가끔 떨어지는 <strong>하트</strong>로 체력을 회복합니다.',
            '<strong>레벨 15</strong>에서 보스 등장 → 처치하면 클리어.',
        ],
        tipsL: [
            '계속 움직이며 적 무리를 피하세요. 자동 공격이 알아서 처리합니다.',
            '범위 공격(AoE)과 관통 투사체는 다수의 적에게 강력합니다.',
            '흡혈·방어·체력회복은 보스전 생존력을 크게 올립니다.',
            '독·화상 장판 위에 오래 서 있지 마세요.',
        ],
        thPU: ['파워업', '효과'], thAtk: ['공격', '피해', '쿨타임', '사거리', '효과'],
        thStatus: ['효과', '설명'], thEnemy: ['적', '등장 레벨', '체력', '속도', '공격', '경험치'],
        status: [
            ['🔥 화상 (Burn)', `틱마다 최대 체력의 ${status.burn.damagePercent}% 피해`],
            ['☠️ 독 (Poison)', `틱마다 현재 체력의 ${status.poison.damagePercent}% 피해`],
            ['❄️ 빙결 (Freeze)', `이동 속도 ${100 - status.freeze.multiplierPercent}% 감소`],
            ['⭐ 기절 (Stun)', '잠시 이동·공격 불가'],
        ],
        footer: '게임 데이터에서 자동 생성됨', puDesc: (p) => PU_KO[p.name] || p.en,
    },
    en: {
        htmlTitle: 'How to Play · Survival Game guide',
        metaDesc: 'How to play Survival Game, a browser vampire-survivors-style roguelike — controls, core loop, power-ups, attacks, status effects and enemies.',
        h1: '📖 How to Play',
        intro: 'Controls, the core loop, power-ups, enemies and status effects. New here? Start with this.',
        play: '▶ Play', records: '🏆 Leaderboard',
        objective: '🎯 Objective', controls: '🎮 Controls', loop: '🔄 Core Loop',
        powerups: '⬆️ Power-Ups', attacksH: '💥 Attacks', statusH: '✨ Status Effects', enemiesH: '👾 Enemies', tips: '💡 Tips',
        objectiveP: 'Survive the endless waves, level up, and defeat the <strong>boss that appears at level 15 (30,000 HP)</strong> to <strong>win (You Win!)</strong>.',
        controlsL: [
            '<strong>Move</strong>: arrow keys <kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd> (on-screen joystick on mobile).',
            '<strong>Attack</strong>: <strong>automatic</strong> — auto-aims and fires at the nearest enemy.',
            '<strong>Level-up</strong>: number keys <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> or click; <kbd>Esc</kbd> to cancel.',
        ],
        loopL: [
            'Killing enemies drops <strong>XP</strong> → walk over it to collect.',
            'Fill the XP bar to <strong>level up</strong> → pick one power-up to grow stronger.',
            'Higher levels spawn enemies faster and tougher.',
            'Occasional <strong>hearts</strong> restore health.',
            'At <strong>level 15</strong> the boss appears → defeat it to clear.',
        ],
        tipsL: [
            'Keep moving and kite the swarms — your auto-attack handles the rest.',
            'AoE circles and piercing projectiles shred crowds.',
            'Life steal, defense and health restoration boost boss-fight survivability.',
            "Don't linger on poison or burn fields.",
        ],
        thPU: ['Power-Up', 'Effect'], thAtk: ['Attack', 'Power', 'Cooldown', 'Range', 'Effect'],
        thStatus: ['Effect', 'Description'], thEnemy: ['Enemy', 'Levels', 'HP', 'Speed', 'Atk', 'XP'],
        status: [
            ['🔥 Burn', `${status.burn.damagePercent}% of max HP per tick`],
            ['☠️ Poison', `${status.poison.damagePercent}% of current HP per tick`],
            ['❄️ Freeze', `slows movement to ${status.freeze.multiplierPercent}%`],
            ['⭐ Stun', 'briefly disables movement and attacks'],
        ],
        footer: 'auto-generated from game data', puDesc: (p) => p.en,
    },
};

const row = (cells) => `<tr>${cells.map((c) => `<td>${c}</td>`).join('')}</tr>`;
const thead = (cells) => `<thead><tr>${cells.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead>`;
const ul = (items) => `<ul class="loop">${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;

const CSS = `
  :root{color-scheme:dark;}*{box-sizing:border-box;}
  body{margin:0;background:#0a0a0a;color:#eee;font-family:"Noto Sans",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.6;}
  a{color:#66ccff;}
  header.top{padding:24px 20px 8px;text-align:center;}
  header.top h1{margin:0 0 6px;font-size:clamp(24px,5vw,40px);color:#ffd700;}
  header.top p.intro{max-width:760px;margin:8px auto 0;color:#bbb;font-size:14px;}
  .nav{text-align:center;margin:14px 0 4px;}
  .nav a{display:inline-block;padding:8px 16px;margin:0 4px;background:#1a1a1a;border-radius:8px;text-decoration:none;font-weight:600;}
  main{max-width:900px;margin:0 auto;padding:8px 16px 60px;}
  section{margin:28px 0;}
  h2{color:#66ccff;border-bottom:2px solid #223;padding-bottom:6px;font-size:21px;}
  ul.loop{padding-left:20px;}ul.loop li{margin:6px 0;}
  kbd{background:#222;border:1px solid #444;border-bottom-width:2px;border-radius:5px;padding:1px 7px;font-family:ui-monospace,monospace;font-size:13px;}
  .table-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;}
  table{width:100%;border-collapse:collapse;font-size:14px;min-width:520px;margin-top:8px;}
  th,td{padding:8px 10px;text-align:left;border-bottom:1px solid #1c1c1c;}
  th{color:#999;font-weight:600;}td:first-child{font-weight:600;white-space:nowrap;}
  .callout{background:#14140a;border-left:3px solid #ffd700;padding:10px 14px;border-radius:4px;}
  footer{text-align:center;color:#666;font-size:12px;padding:24px;}`;

function renderPage(loc) {
    const t = STR[loc.code];
    const puRows = powerUps.map((p) => row([esc(p.name), esc(t.puDesc(p))])).join('');
    const atkRows = attacks.map((a) => row([esc(a.name), a.attackPower, a.attackSpeed + 'ms', a.attackRange, a.statusEffect ? esc(a.statusEffect) : '—'])).join('');
    const statusRows = t.status.map(([n, d]) => row([esc(n), esc(d)])).join('');
    const enemyRows = enemies.slice().sort((a, b) => a.fromLevel - b.fromLevel)
        .map((e) => row([esc(humanEnemy(e.type)), `Lv ${e.fromLevel}–${e.toLevel}`, e.health, e.speed, e.attackPower, e.experiencePoint])).join('');

    const sec = (title, inner) => `<section><h2>${esc(title)}</h2>${inner}</section>`;
    const table = (head, rows) => `<div class="table-wrap"><table>${thead(head)}<tbody>${rows}</tbody></table></div>`;

    return `<!DOCTYPE html>
<html lang="${loc.htmlLang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(t.htmlTitle)}</title>
<meta name="description" content="${esc(t.metaDesc)}">
<link rel="canonical" href="${altUrl(loc.code, FILE)}">
${hreflangTags(FILE)}
<meta name="robots" content="index, follow">
<meta property="og:type" content="article">
<meta property="og:title" content="${esc(t.h1)} — Survival Game">
<meta property="og:description" content="${esc(t.metaDesc)}">
<meta property="og:url" content="${altUrl(loc.code, FILE)}">
<meta property="og:image" content="${SITE}/assets/start.webp">
<link rel="icon" type="image/png" href="/assets/player.png">
<style>${CSS}</style>
</head>
<body>
<header class="top">
  <h1>${esc(t.h1)}</h1>
  <p class="intro">${esc(t.intro)}</p>
  <div class="nav"><a href="${localePath(loc.code, '')}">${esc(t.play)}</a><a href="${localePath(loc.code, 'records.html')}">${esc(t.records)}</a>${langSwitchLink(loc.code, FILE)}</div>
</header>
<main>
  ${sec(t.objective, `<p class="callout">${t.objectiveP}</p>`)}
  ${sec(t.controls, ul(t.controlsL))}
  ${sec(t.loop, ul(t.loopL))}
  ${sec(t.powerups, table(t.thPU, puRows))}
  ${sec(t.attacksH, table(t.thAtk, atkRows))}
  ${sec(t.statusH, table(t.thStatus, statusRows))}
  ${sec(t.enemiesH, table(t.thEnemy, enemyRows))}
  ${sec(t.tips, ul(t.tipsL))}
</main>
<footer>${esc(t.footer)}</footer>
</body>
</html>
`;
}

function build() {
    for (const loc of LOCALES) {
        const out = path.join(ROOT, loc.dir, FILE);
        fs.mkdirSync(path.dirname(out), { recursive: true });
        fs.writeFileSync(out, renderPage(loc));
    }
    console.log(`build-howto: wrote ${LOCALES.map((l) => (l.dir || '') + FILE).join(', ')} (${powerUps.length} power-ups, ${attacks.length} attacks, ${enemies.length} enemies)`);
}

build();
