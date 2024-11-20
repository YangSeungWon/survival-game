import { AttackConfig } from '../../attacks/Attack';
import { MeleeAttackConfig } from '../../attacks/MeleeAttack';
import GameScene from '../../scenes/GameScene';
import MeleeEnemy from './MeleeEnemy';

export default class StrongEnemy extends MeleeEnemy {
    static readonly TYPE = 'StrongEnemy';
    static readonly FROM_LEVEL = 2;
    static readonly TO_LEVEL = 7;

    constructor(scene: GameScene) {
        const color: number = 0x0000ff;
        const size: number = 18;
        const speed: number = 140;
        const health: number = 400;
        
        // 공격 속성 정의
        const attackSpeed: number = 1000; 
        const attackPower: number = 500;  
        const attackRange: number = 30;
        const attackAngle: number = 40;
        const experiencePoint: number = 10;

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
