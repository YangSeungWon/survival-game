import Phaser from 'phaser';
import RangedEnemy from './RangedEnemy';
import GameScene from '../../scenes/GameScene';
import { ProjectileAttackConfig } from '../../attacks/ProjectileAttack';
import { AttackConfig, StatusEffectType } from '../../attacks/Attack';

export default class FireballWizard extends RangedEnemy {
    static readonly TYPE = 'FireballWizard';
    static readonly FROM_LEVEL = 7;
    static readonly TO_LEVEL = 15;

    constructor(scene: GameScene) {
        const color: number = 0xff5500;   // A fiery color
        const size: number = 12;          // Slightly larger size
        const speed: number = 80;         // Slower speed
        const health: number = 150;       // Moderate health
        
        // 공격 속성 정의
        const attackSpeed: number = 2000;  // Slower attack speed
        const attackPower: number = 1500;  // Higher attack power
        const attackRange: number = 200;  // Longer attack range

        const experiencePoint: number = 20; // More experience points

        const projectileSpeed: number = 150; // Slower projectile speed
        const projectileSize: number = 10;   // Larger projectile size

        const burnDuration: number = 1000; // Duration of burn effect in milliseconds

        const config: AttackConfig & ProjectileAttackConfig = {
            attackSpeed: attackSpeed,
            attackPower: attackPower,
            attackRange: attackRange,
            attackColor: color,
            projectileSpeed: projectileSpeed,
            projectileSize: projectileSize,
            piercingCount: 1,
            statusEffect: {
                type: StatusEffectType.BURN,
                duration: burnDuration
            }
        };

        super(scene, color, size, speed, health, config, experiencePoint);
    }
}
