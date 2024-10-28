import Enemy from './Enemy.js';

export default class StrongEnemy extends Enemy {
    constructor(scene) {
        super(scene, 0x0000ff, 20, 50, 3); // 파란색 강한 적
    }
}
