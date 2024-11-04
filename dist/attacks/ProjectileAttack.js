import Phaser from 'phaser';
import Attack from './Attack';
export default class ProjectileAttack extends Attack {
    constructor(scene, owner, config) {
        super(scene, owner, config);
        this.scene = scene;
        this.projectileSpeed = config.projectileSpeed;
        this.projectileColor = config.projectileColor;
        this.projectileSize = config.projectileSize;
    }
    initAttackBar(scene, attackRange, attackPower) {
        const barLength = 20 + attackRange * 0.01;
        const barHeight = 5 + attackPower * 0.01; // Thickness of the bar
        super.initAttackBar(scene, barLength, barHeight);
    }
    performAttack() {
        if (this.isAttacking)
            return;
        this.isAttacking = true;
        // Show and animate the attack bar
        this.attackBar.setPosition(this.owner.x, this.owner.y);
        // Scale the attack bar down and then back up
        this.scene.tweens.add({
            targets: this.attackBar,
            scaleX: 0.5, // Scale down to 50%
            scaleY: 0.5,
            duration: 100,
            yoyo: true
        });
        // Fire the projectile towards the player
        this.scene.projectilePool.fireProjectile(this.owner, Phaser.Math.DegToRad(this.attackBar.angle), this.projectileSpeed, this.attackPower, this.projectileColor, this.projectileSize);
        // Reset attack state after attackSpeed delay
        this.scene.time.delayedCall(this.attackSpeed, () => {
            this.isAttacking = false;
        }, [], this);
    }
    destroy() {
        if (this.attackBar) {
            this.attackBar.destroy();
        }
        super.destroy();
    }
}
//# sourceMappingURL=ProjectileAttack.js.map