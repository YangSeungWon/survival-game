import Phaser from 'phaser';
import RangedEnemy from './RangedEnemy';
import GameScene from '../../scenes/GameScene';
import { AttackConfig } from '../../attacks/Attack';
import { ProjectileAttackConfig } from '../../attacks/ProjectileAttack';
import EnemyStats, { EnemyStat } from '../../utils/EnemyStats';

export default class GunEnemy extends RangedEnemy {
    static readonly TYPE = 'GunEnemy';
    static readonly FROM_LEVEL = 4;
    static readonly TO_LEVEL = 8;

    constructor(scene: GameScene) {
        const enemyStat: EnemyStat = EnemyStats.find(stat => stat.type === GunEnemy.TYPE)!;

        const color: number = enemyStat.color;   
        const size: number = enemyStat.size;
        const speed: number = enemyStat.speed;
        const health: number = enemyStat.health;
        
        // 공격 속성 정의
        const attackSpeed: number = enemyStat.attackSpeed; 
        const attackPower: number = enemyStat.attackPower;
        const attackRange: number = enemyStat.attackRange;

        const experiencePoint: number = enemyStat.experiencePoint;

        const projectileSpeed: number = enemyStat.projectileSpeed!;    
        const projectileSize: number = enemyStat.projectileSize!;   
        

        const config: AttackConfig & ProjectileAttackConfig = {
            attackSpeed: attackSpeed,
            attackPower: attackPower,
            attackRange: attackRange,
            attackColor: color,
            projectileSpeed: projectileSpeed,
            projectileSize: projectileSize,
            piercingCount: 0
        }

        super(scene, color, size, speed, health, config, experiencePoint);
    }

    public getType(): string {
        return GunEnemy.TYPE;
    }
}
