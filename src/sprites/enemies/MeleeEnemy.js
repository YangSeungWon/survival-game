import Enemy from './Enemy.js';

export default class MeleeEnemy extends Enemy {
    constructor(scene, color, size, moveSpeed, health, attackSpeed, attackPower, attackRange) {
        super(scene, color, size, moveSpeed, health, attackSpeed, attackPower, attackRange);
    }

    attack(player) {
        // 공격하기 전 잠시 멈추기
        this.canMove = false;
        this.canAttack = false;
        this.setVelocity(0, 0);

        player.takeDamage(this.attackPower);

        // 공격 후 잠시 멈추기
        this.scene.time.delayedCall(this.attackSpeed, () => {
            this.canMove = true;
            this.canAttack = true;
        }, [], this);
    }
}