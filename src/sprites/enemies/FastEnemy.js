import Enemy from '../Enemy.js';

export default class FastEnemy extends Enemy {
    constructor(scene) {
        const color = 0xff0000;   
        const size = 10;
        const speed = 150;
        const health = 1;
        
        // Define attack properties
        const attackSpeed = 1000; // Attacks every 1 second
        const attackPower = 10;    // Deals 10 damage per attack
        const attackRange = 60;    // Can attack when within 60 pixels

        super(scene, color, size, speed, health, attackSpeed, attackPower, attackRange); // 빨간색 빠른 적
    }
}
