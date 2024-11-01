import MeleeEnemy from './MeleeEnemy.js';

export default class FastEnemy extends MeleeEnemy {
    constructor(scene) {
        const color = 0xff0000;   
        const size = 10;
        const speed = 100;
        const health = 10;
        
        // 공격 속성 정의
        const attackSpeed = 600;
        const attackPower = 50;
        const attackRange = 30;
        const experiencePoint = 10;

        super(scene, color, size, speed, health, attackSpeed, attackPower, attackRange, experiencePoint); // 빨간색 빠른 적
    }
}
