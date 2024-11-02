import RangedEnemy from './RangedEnemy.js';

export default class GunEnemy extends RangedEnemy {
    constructor(scene) {
        const color = 0x5555ff;   
        const size = 10;
        const speed = 50;
        const health = 20;
        
        // 공격 속성 정의
        const attackSpeed = 500; 
        const attackPower = 10;
        const attackRange = 300;

        const experiencePoint = 10;

        const projectileSpeed = 300;    
        const projectileColor = 0xababff;
        const projectileSize = 5;       

        super(scene, color, size, speed, health, attackSpeed, attackPower, attackRange, experiencePoint, projectileSpeed, projectileColor, projectileSize);
    }
}