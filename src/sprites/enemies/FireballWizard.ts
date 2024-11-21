import Phaser from 'phaser';
import RangedEnemy from './RangedEnemy';
import GameScene from '../../scenes/GameScene';
import { ProjectileAttackConfig } from '../../attacks/ProjectileAttack';
import { AttackConfig, StatusEffectType } from '../../attacks/Attack';
import EnemyStats, { EnemyStat } from '../../utils/EnemyStats';

export default class FireballWizard extends RangedEnemy {
    static readonly TYPE = 'FireballWizard';
    static readonly FROM_LEVEL = 7;
    static readonly TO_LEVEL = 11;

    constructor(scene: GameScene) {
        const enemyStat: EnemyStat = EnemyStats.find(stat => stat.type === FireballWizard.TYPE)!;

        const color: number = enemyStat.color;   // A fiery color
        const size: number = enemyStat.size;          // Slightly larger size
        const speed: number = enemyStat.speed;         // Slower speed
        const health: number = enemyStat.health;       // Moderate health
        
        // 공격 속성 정의
        const attackSpeed: number = enemyStat.attackSpeed;  // Slower attack speed
        const attackPower: number = enemyStat.attackPower;  // Higher attack power
        const attackRange: number = enemyStat.attackRange;  // Longer attack range

        const experiencePoint: number = enemyStat.experiencePoint; // More experience points

        const projectileSpeed: number = enemyStat.projectileSpeed!; // Slower projectile speed
        const projectileSize: number = enemyStat.projectileSize!;   // Larger projectile size

        const burnDuration: number = enemyStat.effectDuration!; // Duration of burn effect in milliseconds

        const config: AttackConfig & ProjectileAttackConfig = {
            attackSpeed: attackSpeed,
            attackPower: attackPower,
            attackRange: attackRange,
            attackColor: color,
            projectileSpeed: projectileSpeed,
            projectileSize: projectileSize,
            piercingCount: 0
        };

        super(scene, color, size, speed, health, config, experiencePoint);
    }

    public getType(): string {
        return FireballWizard.TYPE;
    }
}
