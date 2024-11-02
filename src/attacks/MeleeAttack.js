import Attack from './Attack.js';
import Player from '../sprites/Player.js';

export default class MeleeAttack extends Attack {
    constructor(scene, owner, config) {
        super(scene, owner, config);
    }

    initAttackBar(scene, attackRange, attackPower) {
        const barLength = attackRange;
        const barHeight = 3 + attackPower * 0.01; // Thickness of the bar
        super.initAttackBar(scene, barLength, barHeight);

        this.attackBar.setVisible(false);
    }

    performAttack() {
        if (this.isAttacking) return;

        this.isAttacking = true;

        this.showAttackMotion();

        // Reset attack state after attackSpeed delay
        this.scene.time.delayedCall(this.attackSpeed, () => {
            this.isAttacking = false;
        }, [], this);
    }

    showAttackMotion() {
        // Show and animate the attack bar
        this.attackBar.setVisible(true);
        this.attackBar.setPosition(this.owner.x, this.owner.y);

        // Calculate angle towards the player
        const facingAngle = this.owner.facingAngle;
        this.attackBar.setRotation(facingAngle - Phaser.Math.DegToRad(20));

        this.giveDamage();

        // Animate the swing (e.g., a quick rotation)
        this.scene.tweens.add({
            targets: this.attackBar,
            rotation: facingAngle + Phaser.Math.DegToRad(20),
            duration: 100,
            yoyo: true,
            onComplete: () => {
                if (this.attackBar) {
                    this.attackBar.setVisible(false);
                }
            }
        });
    }

    giveDamage() {
        const target = this.owner instanceof Player ? this.scene.enemies : this.scene.player;
        // Calculate the attack area based on position and angle with 40 degree arc
        const attackAngle = this.attackBar.rotation;
        const arcAngle = Phaser.Math.DegToRad(40); // 40 degree arc
        const halfArc = arcAngle / 2;

        if (Array.isArray(target)) {
            // For enemies array
            target.forEach(enemy => {
                // Calculate angle to target
                const angleToTarget = Phaser.Math.Angle.Between(
                    this.owner.x, 
                    this.owner.y,
                    enemy.x, 
                    enemy.y
                );

                // Get angle difference
                let angleDiff = Math.abs(Phaser.Math.Angle.Wrap(angleToTarget - attackAngle));

                // Check if target is within arc and range
                const distance = Phaser.Math.Distance.Between(
                    this.owner.x,
                    this.owner.y,
                    enemy.x,
                    enemy.y
                );

                if (distance <= this.attackRange && angleDiff <= halfArc) {
                    enemy.takeDamage(this.attackPower);
                }
            });
        } else {
            // For single player target
            const angleToTarget = Phaser.Math.Angle.Between(
                this.owner.x,
                this.owner.y,
                target.x,
                target.y
            );

            let angleDiff = Math.abs(Phaser.Math.Angle.Wrap(angleToTarget - attackAngle));
            const distance = Phaser.Math.Distance.Between(
                this.owner.x,
                this.owner.y,
                target.x,
                target.y
            );

            if (distance <= this.attackRange && angleDiff <= halfArc) {
                target.takeDamage(this.attackPower);
            }
        }
    }

    destroy() {
        if (this.timerEvent) {
            this.timerEvent.remove(false);
            this.timerEvent = null;
        }
        if (this.attackBar) {
            this.attackBar.destroy();
            this.attackBar = null;
        }
        super.destroy();
    }
}
