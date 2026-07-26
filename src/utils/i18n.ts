/**
 * In-game UI localization. Locale follows the URL like the static pages:
 * "/en/..." → English, everything else → Korean.
 *
 * Only display text is localized. Identifiers that get stored (e.g. power-up
 * names written to records.json) stay in English — see localizePowerUp, which
 * translates the *display* while callers keep the English name as the key.
 */
export type Locale = 'ko' | 'en';

export function getLocale(): Locale {
    return (typeof location !== 'undefined' && location.pathname.startsWith('/en')) ? 'en' : 'ko';
}

type Dict = Record<string, string>;

const EN: Dict = {
    clickToPlay: 'Click Anywhere to Play',
    howToPlay: '📖 How to Play',
    records: '🏆 Records',
    // HUD / stats labels (value appended by caller)
    health: 'Health', time: 'Time', xp: 'XP', powerUps: 'Power-Ups',
    level: 'Level', bossHealth: 'Boss Health', xpThreshold: 'XP Threshold',
    spawnInterval: 'Enemy Spawn Interval', moveSpeed: 'Move Speed', lifeSteal: 'Life Steal (%)',
    defense: 'Defense', critChance: 'Critical Hit Chance (%)', attacks: 'Attacks', experience: 'Experience',
    // Result screen
    youWin: 'You Win!', gameOver: 'Game Over', retry: 'Retry', share: 'Share',
    downloadScreenshot: 'Download Screenshot', copyRecord: '📋 Copy Record',
    // Messages
    recordCopied: 'Record JSON copied — paste into records.json',
    recordCopyFailed: 'Failed to copy record.',
    shareCopied: 'Share text copied to clipboard!',
    shareFailed: 'Failed to copy share text.',
    screenshotLoadFailed: 'Failed to load screenshot.',
    // Power-up selection
    cancel: 'Cancel',
    chooseUpgrade: 'Level {level}! Choose a Power-Up:',
    // Share text
    shareResultWin: '[Survival Game] I won!',
    shareResultLose: '[Survival Game] I was defeated.',
    noPowerUps: 'No power-ups',
};

const KO: Dict = {
    clickToPlay: '아무 곳이나 클릭하여 시작',
    howToPlay: '📖 게임 방법',
    records: '🏆 기록',
    health: '체력', time: '시간', xp: '경험치', powerUps: '파워업',
    level: '레벨', bossHealth: '보스 체력', xpThreshold: '경험치 임계값',
    spawnInterval: '적 스폰 간격', moveSpeed: '이동 속도', lifeSteal: '흡혈(%)',
    defense: '방어력', critChance: '치명타 확률(%)', attacks: '공격', experience: '경험치',
    youWin: '승리!', gameOver: '게임 오버', retry: '다시하기', share: '공유',
    downloadScreenshot: '스크린샷 저장', copyRecord: '📋 기록 복사',
    recordCopied: '기록 JSON 복사됨 — records.json에 붙여넣으세요',
    recordCopyFailed: '기록 복사에 실패했습니다.',
    shareCopied: '공유 텍스트가 클립보드에 복사되었습니다!',
    shareFailed: '공유 텍스트 복사에 실패했습니다.',
    screenshotLoadFailed: '스크린샷을 불러오지 못했습니다.',
    cancel: '취소',
    chooseUpgrade: '레벨 {level}! 파워업 선택:',
    shareResultWin: '[Survival Game] 클리어했습니다!',
    shareResultLose: '[Survival Game] 패배했습니다.',
    noPowerUps: '파워업 없음',
};

const DICT: Record<Locale, Dict> = { ko: KO, en: EN };

/** Translate a key, interpolating {name} placeholders. Falls back to English, then the key. */
export function t(key: string, params?: Record<string, string | number>): string {
    let s = DICT[getLocale()][key] ?? EN[key] ?? key;
    if (params) for (const k of Object.keys(params)) s = s.replace(`{${k}}`, String(params[k]));
    return s;
}

// Korean display for power-ups. The English name stays the stored identifier.
const PU_KO: Record<string, { name: string; desc: string }> = {
    'Health Boost': { name: '체력 회복 강화', desc: '체력 회복량 +500' },
    'Move Speed': { name: '이동 속도', desc: '이동 속도 +50' },
    'Life Steal': { name: '흡혈', desc: '입힌 피해의 5%만큼 체력 회복' },
    'Defense Boost': { name: '방어력 강화', desc: '방어력 +100' },
    'Critical Hit Chance': { name: '치명타 확률', desc: '치명타 확률 +20%' },
    'Piercing Projectile': { name: '관통 투사체', desc: '관통 투사체 추가' },
    'Melee Attack': { name: '근접 공격', desc: '근접 공격 추가' },
    'Burning AoE': { name: '화상 장판', desc: '화상 장판 추가' },
    'Freezing AoE': { name: '빙결 장판', desc: '빙결 장판 추가' },
    'Poisoning AoE': { name: '독 장판', desc: '독 장판 추가' },
    'Stunning Projectile': { name: '기절 투사체', desc: '기절 투사체 추가' },
    'One shot Projectile': { name: '원샷 투사체', desc: '원샷(고데미지) 투사체 추가' },
    'Farthest Beam Attack': { name: '최원거리 빔', desc: '사거리 내 가장 먼 적에게 빔 발사' },
};

/** Localized display name/description for a power-up (English name is the key). */
export function localizePowerUp(name: string, descriptionEn: string): { name: string; desc: string } {
    if (getLocale() === 'ko' && PU_KO[name]) return PU_KO[name];
    return { name, desc: descriptionEn };
}

/** Localized display name for a stored (English) power-up name. */
export function localizePowerUpName(name: string): string {
    return getLocale() === 'ko' && PU_KO[name] ? PU_KO[name].name : name;
}

// Korean display for attack class names (HUD only — stored records stay English).
const ATTACK_KO: Record<string, string> = {
    ProjectileAttack: '투사체',
    MeleeAttack: '근접',
    AreaOfEffectAttack: '장판',
    TargetedAreaOfEffectAttack: '표적 장판',
    BeamAttack: '빔',
};

/** Localized display name for an attack class name. */
export function localizeAttackName(className: string): string {
    return getLocale() === 'ko' && ATTACK_KO[className] ? ATTACK_KO[className] : className;
}
