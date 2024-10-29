import MeleeEnemy from './MeleeEnemy.js';

export default class FastEnemy extends MeleeEnemy {
    constructor(scene) {
        const color = 0xff0000;   
        const size = 10;
        const speed = 100;
        const health = 1;
        
        // 공격 속성 정의
        const attackSpeed = 300;
        const attackPower = 5;
        const attackRange = 60;

        super(scene, color, size, speed, health, attackSpeed, attackPower, attackRange); // 빨간색 빠른 적
    }
}
