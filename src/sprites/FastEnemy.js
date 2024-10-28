import Enemy from './Enemy.js';

export default class FastEnemy extends Enemy {
    constructor(scene) {
        super(scene, 0xff0000, 10, 150, 1); // 빨간색 빠른 적
    }
}
