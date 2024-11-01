import MeleeEnemy from './MeleeEnemy.js';

export default class StrongEnemy extends MeleeEnemy {
    constructor(scene) {
        const color = 0x0000ff;
        const size = 30;
        const speed = 30;
        const health = 100;
        
        // 공격 속성 정의
        const attackSpeed = 2000; 
        const attackPower = 300;  
        const attackRange = 60;

        const experiencePoint = 10;

        super(scene, color, size, speed, health, attackSpeed, attackPower, attackRange, experiencePoint); // 파란색 강한 적
    }
}
