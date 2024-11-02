import MeleeEnemy from './MeleeEnemy.js';

export default class StrongEnemy extends MeleeEnemy {
    constructor(scene) {
        const color = 0x0000ff;
        const size = 20;
        const speed = 50;
        const health = 70;
        
        // 공격 속성 정의
        const attackSpeed = 1000; 
        const attackPower = 100;  
        const attackRange = 40;

        const experiencePoint = 10;

        super(scene, color, size, speed, health, attackSpeed, attackPower, attackRange, experiencePoint); // 파란색 강한 적
    }
}
