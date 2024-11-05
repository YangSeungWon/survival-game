import { createAttackBarTexture } from '../utils/TextureGenerator';
export default class Attack {
    constructor(scene, owner, config) {
        this.scene = scene;
        this.owner = owner;
        this.attackRange = config.attackRange;
        this.attackSpeed = config.attackSpeed;
        this.attackPower = config.attackPower;
        this.isAttacking = false;
        this.initAttackBar(scene, this.attackRange, this.attackPower);
    }
    initAttackBar(scene, barLength, barHeight) {
        const barKey = `attackBar_${this.constructor.name}_${this.owner.color}_${barLength}_${barHeight}`;
        createAttackBarTexture(scene, barKey, this.owner.color, barLength, barHeight);
        this.attackBar = scene.physics.add.sprite(this.owner.x, this.owner.y, barKey);
        this.attackBar.setOrigin(0, 1);
        this.attackBar.setDepth(this.owner.depth + 1);
        this.attackBar.setVisible(true);
    }
    updateAttackBar() {
        if (this.attackBar) {
            this.attackBar.setPosition(this.owner.x, this.owner.y);
            if (!this.isAttacking) {
                this.attackBar.setRotation(this.owner.facingAngle);
            }
        }
    }
    destroy() {
        // 서브클래스에서 오버라이드 가능
    }
}
//# sourceMappingURL=Attack.js.map