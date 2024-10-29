import RangedEnemy from './RangedEnemy.js';

export default class GunEnemy extends RangedEnemy {
    constructor(scene) {
        const color = 0x5555ff;   
        const size = 15;
        const speed = 100;
        const health = 1;
        
        // 공격 속성 정의
        const attackSpeed = 500; 
        const attackPower = 1;
        const attackRange = 500;
        const projectileSpeed = 300;    
        const projectileColor = 0xababff;
        const projectileSize = 5;       

        super(scene, color, size, speed, health, attackSpeed, attackPower, attackRange, projectileSpeed, projectileColor, projectileSize);
    }
}