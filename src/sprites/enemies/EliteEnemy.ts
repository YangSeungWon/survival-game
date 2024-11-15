import GameScene from '../../scenes/GameScene';
import MeleeEnemy from './MeleeEnemy';
import { AttackConfig } from '../../attacks/Attack';
import { MeleeAttackConfig } from '../../attacks/MeleeAttack';

export default class EliteEnemy extends MeleeEnemy {
    static readonly TYPE = 'EliteEnemy';
    static readonly FROM_LEVEL = 10;
    static readonly TO_LEVEL = 14;

    constructor(scene: GameScene) {
        const color: number = 0xff2200; // Changed color to red for visual distinction
        const size: number = 15; // Further increased size for more visual impact
        const speed: number = 160; // Slightly increased speed
        const health: number = 1000; // Increased health for more durability
        
        // 공격 속성 정의
        const attackSpeed: number = 1500; // Faster attack speed
        const attackPower: number = 1500; // Increased attack power
        const attackRange: number = 50; // Increased attack range
        const attackAngle: number = 45; // Slightly wider attack angle
        const experiencePoint: number = 30; // More experience points

        const config: AttackConfig & MeleeAttackConfig = {
            attackSpeed: attackSpeed,
            attackPower: attackPower,
            attackRange: attackRange,
            attackAngle: attackAngle,
            attackColor: color
        };

        super(scene, color, size, speed, health, config, experiencePoint);
    }
}
