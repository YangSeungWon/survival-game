import GameScene from '../../scenes/GameScene';
import MeleeEnemy from './MeleeEnemy';

export default class StrongEnemy extends MeleeEnemy {
    constructor(scene: GameScene) {
        const color: number = 0x0000ff;
        const size: number = 20;
        const speed: number = 80;
        const health: number = 70;
        
        // 공격 속성 정의
        const attackSpeed: number = 1000; 
        const attackPower: number = 100;  
        const attackRange: number = 50;
        const attackAngle: number = 40;

        const experiencePoint: number = 10;

        super(scene, color, size, speed, health, attackSpeed, attackPower, attackRange, experiencePoint, attackAngle); // 파란색 강한 적
    }
}
