import { AttackConfig } from '../../attacks/Attack';
import { MeleeAttackConfig } from '../../attacks/MeleeAttack';
import GameScene from '../../scenes/GameScene';
import MeleeEnemy from './MeleeEnemy';
import EnemyStats, { EnemyStat } from '../../utils/EnemyStats';

export default class StrongEnemy extends MeleeEnemy {
    static readonly TYPE = 'StrongEnemy';
    static readonly FROM_LEVEL = 2;
    static readonly TO_LEVEL = 7;

    constructor(scene: GameScene) {
        const enemyStat: EnemyStat = EnemyStats.find(stat => stat.type === StrongEnemy.TYPE)!;

        const color: number = enemyStat.color;
        const size: number = enemyStat.size;
        const speed: number = enemyStat.speed;
        const health: number = enemyStat.health;
        
        // 공격 속성 정의
        const attackSpeed: number = enemyStat.attackSpeed; 
        const attackPower: number = enemyStat.attackPower;  
        const attackRange: number = enemyStat.attackRange;
        const attackAngle: number = enemyStat.attackAngle!;
        const experiencePoint: number = enemyStat.experiencePoint;

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
        return StrongEnemy.TYPE;
    }
}
