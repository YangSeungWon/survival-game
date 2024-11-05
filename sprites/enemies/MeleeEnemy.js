import Enemy from './Enemy';
import MeleeAttack from '../../attacks/MeleeAttack';
export default class MeleeEnemy extends Enemy {
    constructor(scene, color, size, moveSpeed, health, attackSpeed, attackPower, attackRange, experiencePoint, attackAngle) {
        super(scene, color, size, moveSpeed, health, attackSpeed, attackPower, attackRange, experiencePoint);
        this.attackTool = new MeleeAttack(scene, this, {
            attackSpeed: attackSpeed,
            attackPower: attackPower,
            attackRange: attackRange,
            attackAngle: attackAngle
        });
    }
    destroy() {
        var _a;
        super.destroy();
        (_a = this.attackTool) === null || _a === void 0 ? void 0 : _a.destroy();
    }
}
//# sourceMappingURL=MeleeEnemy.js.map