import Enemy from '../Enemy.js';

export default class StrongEnemy extends Enemy {

    constructor(scene) {
        const color = 0x0000ff;
        const size = 20;
        const speed = 50;
        const health = 3;
        
        // Define attack properties
        const attackSpeed = 2000; // Attacks every 2 seconds
        const attackPower = 20;    // Deals 20 damage per attack
        const attackRange = 80;    // Can attack when within 80 pixels

        super(scene, color, size, speed, health, attackSpeed, attackPower, attackRange); // 파란색 강한 적
    }
}
