import Enemy from './Enemy.js';
import { createAttackBarTexture } from '../../utils/TextureGenerator.js';

export default class MeleeEnemy extends Enemy {
    constructor(scene, color, size, moveSpeed, health, attackSpeed, attackPower, attackRange, experiencePoint) {
        super(scene, color, size, moveSpeed, health, attackSpeed, attackPower, attackRange, experiencePoint);
    }

    attack(player) {
        // Existing attack logic...
        this.canMove = false;
        this.canAttack = false;
        this.setVelocity(0, 0);

        // Show and animate the attack bar
        this.attackBar.setVisible(true);
        this.attackBar.setPosition(this.x, this.y);

        // Calculate angle towards the player
        const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        this.attackBar.setRotation(angle - Phaser.Math.DegToRad(15));

        // Animate the swing (e.g., a quick rotation)
        this.scene.tweens.add({
            targets: this.attackBar,
            rotation: angle + Phaser.Math.DegToRad(30),
            duration: 100,
            yoyo: true,
            onComplete: () => {
                this.attackBar.setVisible(false);
            }
        });

        player.takeDamage(this.attackPower);

        // Existing delayed call to reset attack state
        this.scene.time.delayedCall(this.attackSpeed, () => {
            this.canMove = true;
            this.canAttack = true;
        }, [], this);
    }

    initAttackBar(scene, color, attackRange, attackPower) {
        const barLength = attackRange;
        const barHeight = attackPower / 20; // Thickness of the bar
        const barKey = `attackBar_${this.constructor.name}_${color}_${barLength}`;

        // Create the attack bar texture
        createAttackBarTexture(scene, barKey, color, barLength, barHeight);

        // Create the attack bar sprite
        this.attackBar = scene.physics.add.sprite(this.x, this.y, barKey);
        this.attackBar.setOrigin(0, 1); // Origin at the bottom
        this.attackBar.setVisible(false); // Hidden by default
        this.attackBar.depth = this.depth + 1; // Ensure it's rendered above the enemy
    }
}