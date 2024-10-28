import Enemy from '../Enemy.js';

export default class StrongEnemy extends Enemy {

    constructor(scene) {
        const color = 0x0000ff;
        const size = 20;
        const speed = 50;
        const health = 3;

        super(scene, color, size, speed, health); // 파란색 강한 적
    }
}
