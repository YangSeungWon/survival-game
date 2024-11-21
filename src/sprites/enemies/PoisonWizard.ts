import Phaser from 'phaser';
import AreaOfEffectEnemy from './AreaOfEffectEnemy';
import GameScene from '../../scenes/GameScene';
import { AttackConfig, StatusEffectType } from '../../attacks/Attack';
import { TargetedAreaOfEffectAttackConfig } from '../../attacks/TargetedAreaOfEffectAttack';
import EnemyStats, { EnemyStat } from '../../utils/EnemyStats';

export default class PoisonWizard extends AreaOfEffectEnemy {
    static readonly TYPE = 'PoisonWizard';
    static readonly FROM_LEVEL = 9;
    static readonly TO_LEVEL = 14;

    constructor(scene: GameScene) {
        const enemyStat: EnemyStat = EnemyStats.find(stat => stat.type === PoisonWizard.TYPE)!;

        const color: number = enemyStat.color;   // A poison-like color
        const size: number = enemyStat.size;          // Standard size
        const speed: number = enemyStat.speed;         // Moderate speed
        const health: number = enemyStat.health;       // Moderate health
        
        // 공격 속성 정의
        const attackSpeed: number = enemyStat.attackSpeed;  // Moderate attack speed
        const attackPower: number = enemyStat.attackPower;  // Moderate attack power
        const attackRange: number = enemyStat.attackRange;   // Moderate attack range

        const experiencePoint: number = enemyStat.experiencePoint; // Moderate experience points

        const poisonDuration: number = enemyStat.effectDuration!; // Duration of poison effect in milliseconds
        const effectRange: number = enemyStat.effectRange!; // Effect range

        const config: TargetedAreaOfEffectAttackConfig = {
            attackSpeed: attackSpeed,
            attackPower: attackPower,
            attackRange: attackRange,
            attackColor: color,
            effectRange: effectRange,
            statusEffect: {
                type: StatusEffectType.POISON,
                id: 'poisonWizardPoison' + Date.now(),
                duration: poisonDuration,
                tickRate: enemyStat.effectTickRate!
            }
        };

        super(scene, color, size, speed, health, config, experiencePoint);
    }

    public getType(): string {
        return PoisonWizard.TYPE;
    }
}
