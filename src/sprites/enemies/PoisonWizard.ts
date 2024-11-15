import Phaser from 'phaser';
import AreaOfEffectEnemy from './AreaOfEffectEnemy';
import GameScene from '../../scenes/GameScene';
import { AttackConfig, StatusEffectType } from '../../attacks/Attack';
import { TargetedAreaOfEffectAttackConfig } from '../../attacks/TargetedAreaOfEffectAttack';

export default class PoisonWizard extends AreaOfEffectEnemy {
    static readonly TYPE = 'PoisonWizard';
    static readonly FROM_LEVEL = 9;
    static readonly TO_LEVEL = 14;

    constructor(scene: GameScene) {
        const color: number = 0x00ff20;   // A poison-like color
        const size: number = 10;          // Standard size
        const speed: number = 130;         // Moderate speed
        const health: number = 100;       // Moderate health
        
        // 공격 속성 정의
        const attackSpeed: number = 1500;  // Moderate attack speed
        const attackPower: number = 100;  // Moderate attack power
        const attackRange: number = 200;   // Moderate attack range

        const experiencePoint: number = 15; // Moderate experience points

        const poisonDuration: number = 1500; // Duration of poison effect in milliseconds
        const effectRange: number = 50; // Effect range

        const config: TargetedAreaOfEffectAttackConfig = {
            attackSpeed: attackSpeed,
            attackPower: attackPower,
            attackRange: attackRange,
            attackColor: color,
            effectRange: effectRange,
            statusEffect: {
                type: StatusEffectType.POISON,
                duration: poisonDuration,
                tickRate: 300
            }
        };

        super(scene, color, size, speed, health, config, experiencePoint);
    }
}
