import Phaser from 'phaser';
import RangedEnemy from './RangedEnemy';
import GameScene from '../../scenes/GameScene';
import { ProjectileAttackConfig } from '../../attacks/ProjectileAttack';
import { AttackConfig, StatusEffectType } from '../../attacks/Attack';

export default class FireballWizard extends RangedEnemy {
    static readonly TYPE = 'FireballWizard';
    static readonly FROM_LEVEL = 7;
    static readonly TO_LEVEL = 11;

    constructor(scene: GameScene) {
        const color: number = 0xff5500;   // A fiery color
        const size: number = 12;          // Slightly larger size
        const speed: number = 90;         // Slower speed
        const health: number = 150;       // Moderate health
        
        // 공격 속성 정의
        const attackSpeed: number = 2000;  // Slower attack speed
        const attackPower: number = 500;  // Higher attack power
        const attackRange: number = 400;  // Longer attack range

        const experiencePoint: number = 40; // More experience points

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
            piercingCount: 0
        };

        super(scene, color, size, speed, health, config, experiencePoint);
    }

    public getType(): string {
        return FireballWizard.TYPE;
    }
}
