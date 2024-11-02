import Attack from './Attack.js';
import Player from '../sprites/Player.js';

export default class MeleeAttack extends Attack {
    constructor(scene, owner, config) {
        super(scene, owner, config);
        this.attackAngle = Phaser.Math.DegToRad(config.attackAngle || 40); // Default to 40 degrees if not provided
    }

    initAttackBar(scene, attackRange, attackPower) {
        const barLength = attackRange;
        const barHeight = 5 + attackPower * 0.01; // Thickness of the bar
        super.initAttackBar(scene, barLength, barHeight);

        this.attackBar.setVisible(false);
    }

    performAttack() {
        if (this.isAttacking) return;

        this.isAttacking = true;

        this.showAttackMotion();

        this.giveDamage();

        // Reset attack state after attackSpeed delay
        this.scene.attackEvents.push(this.scene.time.delayedCall(this.attackSpeed, () => {
            this.isAttacking = false;
        }, [], this));
    }

    showAttackMotion() {
        // Show and animate the attack bar
        this.attackBar.setVisible(true);
        this.attackBar.setPosition(this.owner.x, this.owner.y);

        // Calculate angle towards the player
        const facingAngle = this.owner.facingAngle;
        const halfArc = this.attackAngle / 2;
        this.attackBar.setRotation(facingAngle - halfArc);

        // Animate the swing (e.g., a quick rotation)
        this.scene.tweens.add({
            targets: this.attackBar,
            rotation: facingAngle + halfArc,
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
        const attackAngle = this.owner.facingAngle;
        const halfArc = this.attackAngle / 2;

        if (target instanceof Phaser.Physics.Arcade.Group) {
            // For enemies group
            target.getChildren().forEach(enemy => {
                const angleToTarget = Phaser.Math.Angle.Between(
                    this.owner.x, 
                    this.owner.y,
                    enemy.x, 
                    enemy.y
                );

                let angleDiff = Math.abs(Phaser.Math.Angle.Wrap(angleToTarget - attackAngle));
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
