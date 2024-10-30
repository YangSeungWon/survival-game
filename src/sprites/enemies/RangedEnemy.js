import Enemy from './Enemy.js';

export default class RangedEnemy extends Enemy {
    constructor(scene, color, size, moveSpeed, health, attackSpeed, attackPower, attackRange, experiencePoint, projectileSpeed, projectileColor, projectileSize) {
        super(scene, color, size, moveSpeed, health, attackSpeed, attackPower, attackRange, experiencePoint);
        this.projectileSpeed = projectileSpeed;
        this.projectileColor = projectileColor;
        this.projectileSize = projectileSize;
        this.projectilePool = scene.projectilePool;
    }

    attack(player) {
        // 공격하기 전 잠시 멈추기
        this.canMove = false;
        this.canAttack = false;
        this.setVelocity(0, 0);

        this.scene.time.delayedCall(this.attackSpeed, () => {
            this.projectilePool.fireProjectile(
                this.x, 
                this.y, 
                player.x, 
                player.y, 
                this.projectileSpeed, 
                this.attackPower, 
                this.projectileColor, 
                this.projectileSize,
                'enemy'
            );
            this.canMove = true;

            if (this.active && this.visible) {
                this.scene.time.delayedCall(this.attackSpeed, () => {
                    this.canAttack = true;
                }, [], this);
            }
        }, [], this);
    }
}