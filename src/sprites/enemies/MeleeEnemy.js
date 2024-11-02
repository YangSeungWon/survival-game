import Enemy from './Enemy.js';
import MeleeAttack from '../../attacks/MeleeAttack.js';

export default class MeleeEnemy extends Enemy {
    constructor(scene, color, size, moveSpeed, health, attackSpeed, attackPower, attackRange, experiencePoint) {
        super(scene, color, size, moveSpeed, health, attackSpeed, attackPower, attackRange, experiencePoint);
        this.attackTool = new MeleeAttack(scene, this, {
            attackSpeed: attackSpeed,
            attackPower: attackPower,
            attackRange: attackRange
        });
    }

    destroy() {
        super.destroy();
        this.attackTool.destroy();
    }
}