import Enemy from './Enemy.js';
import ProjectileAttack from '../../attacks/ProjectileAttack.js';

export default class RangedEnemy extends Enemy {
    constructor(scene, color, size, moveSpeed, health, attackSpeed, attackPower, attackRange, experiencePoint, projectileSpeed, projectileColor, projectileSize) {
        super(scene, color, size, moveSpeed, health, attackSpeed, attackPower, attackRange, experiencePoint);
        this.projectileSpeed = projectileSpeed;
        this.projectileColor = projectileColor;
        this.projectileSize = projectileSize;
        this.projectilePool = scene.projectilePool;

        // Initialize ProjectileAttack instance
        this.attackTool = new ProjectileAttack(scene, this, {
            attackSpeed: this.attackSpeed,
            projectileSpeed: this.projectileSpeed,
            attackPower: this.attackPower,
            projectileColor: this.projectileColor,
            projectileSize: this.projectileSize,
            attackRange: this.attackRange
        });
    }

    destroy() {
        super.destroy();
        this.attackTool.destroy();
    }
}