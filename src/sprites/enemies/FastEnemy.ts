import Phaser from 'phaser';
import MeleeEnemy from './MeleeEnemy';
import GameScene from '../../scenes/GameScene';
import { MeleeAttackConfig } from '../../attacks/MeleeAttack';
import { AttackConfig } from '../../attacks/Attack';
import EnemyStats, { EnemyStat } from '../../utils/EnemyStats';

export default class FastEnemy extends MeleeEnemy {
    static readonly TYPE = 'FastEnemy';
    static readonly FROM_LEVEL = 1;
    static readonly TO_LEVEL = 5;

    constructor(scene: GameScene) {
        const enemyStat: EnemyStat = EnemyStats.find(stat => stat.type === FastEnemy.TYPE)!;

        const color = enemyStat.color;   
        const size = enemyStat.size;
        const speed = enemyStat.speed;
        const health = enemyStat.health;
        
        // 공격 속성 정의
        const config: AttackConfig & MeleeAttackConfig = {
            attackSpeed: enemyStat.attackSpeed,
            attackPower: enemyStat.attackPower,
            attackRange: enemyStat.attackRange,
            attackAngle: enemyStat.attackAngle!,
            attackColor: color
        };
        const experiencePoint = enemyStat.experiencePoint;

        super(scene, color, size, speed, health, config, experiencePoint);
    }

    public getType(): string {
        return FastEnemy.TYPE;
    }
}
