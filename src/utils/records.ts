/**
 * Static speedrun record archive.
 *
 * Records live in `records.json` at the repo root (copied to the site by
 * webpack). There is no backend: the game only reads that file to render the
 * archive, and produces a ready-to-paste JSON entry on a win. You curate the
 * archive by committing new entries to `records.json` yourself.
 *
 * Only wins (clears) are recorded. A record's "condition" is its power-up
 * build; if the run had no power-ups, the final derived stats are shown
 * instead (move speed, life steal, defense, crit, attacks).
 */

export interface RecordStats {
    maxHealth: number;
    moveSpeed: number;
    lifeSteal: number;   // percent
    defense: number;
    critChance: number;  // percent
    attacks: string[];   // e.g. "ProjectileAttack P50 S300 R400"
}

export interface RecordEntry {
    time: number;        // milliseconds to clear (lower is better)
    level: number;
    powerUps: string[];
    stats: RecordStats;
    player?: string;
    date?: string;       // YYYY-MM-DD
    note?: string;
}

export interface RecordsFile {
    records: RecordEntry[];
}

/** Formats a clear time as `m:ss.mmm`. */
export function formatRecordTime(milliseconds: number): string {
    const total = Math.max(0, Math.floor(milliseconds));
    const minutes = Math.floor(total / 60000);
    const seconds = Math.floor((total % 60000) / 1000);
    const millis = total % 1000;
    return `${minutes}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
}

/**
 * Describes the run's condition: the power-up build, or — when no power-ups
 * were taken — the final stat line.
 */
export function formatCondition(entry: RecordEntry): string {
    if (entry.powerUps && entry.powerUps.length > 0) {
        return entry.powerUps.join(', ');
    }

    const s = entry.stats;
    if (!s) return 'No power-ups';

    const parts = [
        `HP ${s.maxHealth}`,
        `Speed ${s.moveSpeed}`,
        `LifeSteal ${s.lifeSteal}%`,
        `Def ${s.defense}`,
        `Crit ${s.critChance}%`,
    ];
    if (s.attacks && s.attacks.length > 0) {
        parts.push(`Attacks: ${s.attacks.join(' / ')}`);
    }
    return parts.join(', ');
}

/** Sorts wins fastest-first, returning a new array. */
export function sortRecords(records: RecordEntry[]): RecordEntry[] {
    return [...records].sort((a, b) => a.time - b.time);
}
