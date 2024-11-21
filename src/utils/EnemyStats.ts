import { StatusEffect } from "../attacks/Attack";

export interface EnemyStat {
    type: string;
    color: number;
    size: number;
    speed: number;
    health: number;
    attackSpeed: number;
    attackPower: number;
    attackRange: number;
    attackAngle?: number;
    statusEffect?: StatusEffect;
    projectileSpeed?: number;
    projectileSize?: number;
    effectRange?: number;
    effectDuration?: number;
    effectTickRate?: number;
    beamDuration?: number;
    beamWidth?: number;
    experiencePoint: number;
    fromLevel: number;
    toLevel: number;
}

const EnemyStats: EnemyStat[] = [
    {
        type: 'FastEnemy',
        color: 0xFF0000,
        size: 10,
        speed: 160,
        health: 100,
        attackSpeed: 600,
        attackPower: 300,
        attackRange: 20,
        attackAngle: 20,
        experiencePoint: 5,
        fromLevel: 1,
        toLevel: 5
    },
    {
        type: 'StrongEnemy',
        color: 0x0000FF,
        size: 18,
        speed: 140,
        health: 400,
        attackSpeed: 1000,
        attackPower: 500,
        attackRange: 30,
        attackAngle: 40,
        experiencePoint: 10,
        fromLevel: 2,
        toLevel: 7
    },
    {
        type: 'GunEnemy',
        color: 0xAAAAFF,
        size: 10,
        speed: 120,
        health: 100,
        attackSpeed: 500,
        attackPower: 200,
        attackRange: 200,
        experiencePoint: 10,
        projectileSpeed: 300,
        projectileSize: 5,
        fromLevel: 4,
        toLevel: 8
    },
    {
        type: 'EliteEnemy',
        color: 0xFF2200,
        size: 15,
        speed: 150,
        health: 1000,
        attackSpeed: 1500,
        attackPower: 500,
        attackRange: 40,
        attackAngle: 45,
        experiencePoint: 50,
        fromLevel: 10, 
        toLevel: 14
    },
    {
        type: 'FireballWizard',
        color: 0xFFA500,
        size: 12,
        speed: 90,
        health: 150,
        attackSpeed: 2000,
        attackPower: 500,
        attackRange: 400,
        experiencePoint: 20,
        projectileSpeed: 150,
        projectileSize: 10,
        fromLevel: 7,
        toLevel: 11
    },
    {
        type: 'PoisonWizard',
        color: 0x00FF00,
        size: 10,
        speed: 110,
        health: 100,
        attackSpeed: 3000,
        attackPower: 100,
        attackRange: 200,
        effectRange: 60,
        effectDuration: 1500,
        effectTickRate: 300,
        experiencePoint: 40,
        fromLevel: 9,
        toLevel: 14
    },
    {
        type: 'BeamShooterEnemy',
        color: 0xFFFF00,
        size: 8,
        speed: 50,
        health: 200,
        attackSpeed: 1000,
        attackPower: 40,
        attackRange: 400,
        beamDuration: 1000,
        beamWidth: 5,
        experiencePoint: 25,
        fromLevel: 13,
        toLevel: 14
    },
    // Add more enemies as needed
];

export default EnemyStats;
