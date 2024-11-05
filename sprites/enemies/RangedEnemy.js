import Enemy from './Enemy';
import ProjectileAttack from '../../attacks/ProjectileAttack';
export default class RangedEnemy extends Enemy {
    constructor(scene, color, size, moveSpeed, health, attackSpeed, attackPower, attackRange, experiencePoint, projectileSpeed, projectileColor, projectileSize) {
        super(scene, color, size, moveSpeed, health, attackSpeed, attackPower, attackRange, experiencePoint);
        this.projectileSpeed = projectileSpeed;
        this.projectileColor = projectileColor;
        this.projectileSize = projectileSize;
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
        var _a;
        super.destroy();
        (_a = this.attackTool) === null || _a === void 0 ? void 0 : _a.destroy();
    }
}
//# sourceMappingURL=RangedEnemy.js.map