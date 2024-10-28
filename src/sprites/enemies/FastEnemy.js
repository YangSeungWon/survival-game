import Enemy from '../Enemy.js';

export default class FastEnemy extends Enemy {
    constructor(scene) {
        const color = 0xff0000;   
        const size = 10;
        const speed = 150;
        const health = 1;
    
        super(scene, color, size, speed, health); // 빨간색 빠른 적
    }
}
