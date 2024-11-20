import Phaser from 'phaser';
import RangedEnemy from './RangedEnemy';
import GameScene from '../../scenes/GameScene';
import { AttackConfig } from '../../attacks/Attack';
import { ProjectileAttackConfig } from '../../attacks/ProjectileAttack';

export default class GunEnemy extends RangedEnemy {
    static readonly TYPE = 'GunEnemy';
    static readonly FROM_LEVEL = 4;
    static readonly TO_LEVEL = 8;

    constructor(scene: GameScene) {
        const color: number = 0xaaaaff;   
        const size: number = 10;
        const speed: number = 120;
        const health: number = 100;
        
        // 공격 속성 정의
        const attackSpeed: number = 500; 
        const attackPower: number = 200;
        const attackRange: number = 200;

        const experiencePoint: number = 10;

        const projectileSpeed: number = 300;    
        const projectileSize: number = 5;   
        

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
