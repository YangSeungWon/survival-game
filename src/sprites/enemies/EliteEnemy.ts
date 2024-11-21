import GameScene from '../../scenes/GameScene';
import MeleeEnemy from './MeleeEnemy';
import { AttackConfig } from '../../attacks/Attack';
import { MeleeAttackConfig } from '../../attacks/MeleeAttack';
import EnemyStats, { EnemyStat } from '../../utils/EnemyStats';

export default class EliteEnemy extends MeleeEnemy {
    static readonly TYPE = 'EliteEnemy';
    static readonly FROM_LEVEL = 10;
    static readonly TO_LEVEL = 14;

    constructor(scene: GameScene) {
        const enemyStat: EnemyStat = EnemyStats.find(stat => stat.type === EliteEnemy.TYPE)!;

        const color: number = enemyStat.color; // Changed color to red for visual distinction
        const size: number = enemyStat.size; // Further increased size for more visual impact
        const speed: number = enemyStat.speed; // Slightly increased speed
        const health: number = enemyStat.health; // Increased health for more durability
        
        // 공격 속성 정의
        const attackSpeed: number = enemyStat.attackSpeed; // Faster attack speed
        const attackPower: number = enemyStat.attackPower; // Increased attack power
        const attackRange: number = enemyStat.attackRange; // Increased attack range
        const attackAngle: number = enemyStat.attackAngle!; // Slightly wider attack angle
        const experiencePoint: number = enemyStat.experiencePoint; // More experience points

        const config: AttackConfig & MeleeAttackConfig = {
            attackSpeed: attackSpeed,
            attackPower: attackPower,
            attackRange: attackRange,
            attackAngle: attackAngle,
            attackColor: color
        };

        super(scene, color, size, speed, health, config, experiencePoint);
    }

    public getType(): string {
        return EliteEnemy.TYPE;
    }
}
