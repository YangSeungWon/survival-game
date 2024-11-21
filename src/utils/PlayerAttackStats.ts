import { StatusEffectType } from "../attacks/Attack";

export interface PlayerAttackStat {
    name: string;
    color: number;
    attackSpeed: number;
    attackPower: number;
    attackRange: number;
    attackAngle?: number;
    statusEffect?: StatusEffectType;
    projectileSpeed?: number;
    projectileSize?: number;
    piercingCount?: number;
    effectRange?: number;
    effectDuration?: number;
    effectTickRate?: number;
    beamDuration?: number;
    beamWidth?: number;
}


export const PlayerAttackStats: PlayerAttackStat[] = [
    {
        name: 'Default Attack',
        color: 0xffffff,
        attackSpeed: 200,
        attackPower: 50,
        attackRange: 500,
        projectileSpeed: 400,
        projectileSize: 4,
        piercingCount: 0,
    },
    {
        name: 'Piercing Attack',
        color: 0xa6ffbc,
        attackSpeed: 300,
        attackPower: 20,
        attackRange: 2000,
        projectileSpeed: 300,
        projectileSize: 10,
        piercingCount: 30
    },
    {
        name: 'Melee Attack',
        color: 0xff87e5,
        attackSpeed: 1500,
        attackPower: 1000,
        attackRange: 100,
        attackAngle: 90,
    },
    {
        name: 'Stunning Projectile',
        color: 0xffff00,
        attackSpeed: 200,
        attackPower: 10,
        attackRange: 200,
        projectileSpeed: 700,
        projectileSize: 7,
        piercingCount: 0,
        effectDuration: 500,
        statusEffect: StatusEffectType.STUN,
    },
    {
        name: 'Burning AoE',
        color: 0xff0000,
        attackSpeed: 100,
        attackPower: 0,
        attackRange: 130,
        effectRange: 130,
        effectDuration: 500,
        effectTickRate: 200,
        statusEffect: StatusEffectType.BURN,     
    },
    {
        name: 'Freezing AoE',
        color: 0x0000ff,
        attackSpeed: 100,
        attackPower: 0,
        attackRange: 200,
        effectDuration: 100,
        statusEffect: StatusEffectType.FREEZE,
    },
    {
        name: 'Poisoning AoE',
        color: 0x00ff00,
        attackSpeed: 100,
        attackPower: 0,
        attackRange: 130,
        effectRange: 130,
        effectDuration: 500,
        effectTickRate: 200,
        statusEffect: StatusEffectType.POISON,
    },
    {
        name: 'One Shot Projectile',
        color: 0xa9b5c9,
        attackSpeed: 500,
        attackPower: 1000,
        attackRange: 150,
        projectileSpeed: 300,
        projectileSize: 10,
        piercingCount: 0,
    },
    {
        name: 'Beam Attack',
        color: 0x00ffff,
        attackSpeed: 1000,
        attackPower: 20,
        attackRange: 400,
        beamDuration: 500,
        beamWidth: 7,
    }
]