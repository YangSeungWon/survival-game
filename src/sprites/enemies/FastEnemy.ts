import Phaser from 'phaser';
import MeleeEnemy from './MeleeEnemy';
import GameScene from '../../scenes/GameScene';
import { MeleeAttackConfig } from '../../attacks/MeleeAttack';
import { AttackConfig } from '../../attacks/Attack';

export default class FastEnemy extends MeleeEnemy {
    static readonly TYPE = 'FastEnemy';
    static readonly FROM_LEVEL = 1;
    static readonly TO_LEVEL = 5;

    constructor(scene: GameScene) {
        const color = 0xff0000;   
        const size = 10;
        const speed = 160;
        const health = 100;
        
        // 공격 속성 정의
        const config: AttackConfig & MeleeAttackConfig = {
            attackSpeed: 600,
            attackPower: 300,
            attackRange: 20,
            attackAngle: 20,
            attackColor: color
        };
        const experiencePoint = 5;

        super(scene, color, size, speed, health, config, experiencePoint);
    }
}
