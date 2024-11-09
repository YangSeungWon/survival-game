import Phaser from 'phaser';
import MeleeEnemy from './MeleeEnemy';
import GameScene from '../../scenes/GameScene';

export default class FastEnemy extends MeleeEnemy {
    constructor(scene: GameScene) {
        const color = 0xff0000;   
        const size = 10;
        const speed = 100;
        const health = 100;
        
        // 공격 속성 정의
        const attackSpeed = 600;
        const attackPower = 500;
        const attackRange = 30;
        const attackAngle = 20;
        const experiencePoint = 10;

        super(scene, color, size, speed, health, attackSpeed, attackPower, attackRange, experiencePoint, attackAngle); // 빨간색 빠른 적
    }
}
