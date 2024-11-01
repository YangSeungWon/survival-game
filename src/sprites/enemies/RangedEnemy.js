import Enemy from './Enemy.js';
import { createAttackBarTexture } from '../../utils/TextureGenerator.js';

export default class RangedEnemy extends Enemy {
    constructor(scene, color, size, moveSpeed, health, attackSpeed, attackPower, attackRange, experiencePoint, projectileSpeed, projectileColor, projectileSize) {
        super(scene, color, size, moveSpeed, health, attackSpeed, attackPower, attackRange, experiencePoint);
        this.projectileSpeed = projectileSpeed;
        this.projectileColor = projectileColor;
        this.projectileSize = projectileSize;
        this.projectilePool = scene.projectilePool;
    }

    attack(player) {
        // Existing attack logic...
        this.canMove = false;
        this.canAttack = false;
        this.setVelocity(0, 0);

        // Trigger attack bar animation
        if (this.attackBar) {
            this.attackBar.setScale(0.8); // Example of a "shrink" effect
            this.scene.tweens.add({
                targets: this.attackBar,
                scaleX: 1,
                scaleY: 1,
                duration: 200,
                ease: 'Power1'
            });
        }

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
            });
        }
    }

    initAttackBar(scene, color, attackRange, attackPower) {
        const barLength = attackRange * 0.05; 
        const barHeight = attackPower * 0.5; // Thickness of the bar
        const barKey = `attackBar_${this.constructor.name}_${color}_${barLength}`;

        // Create the attack bar texture
        createAttackBarTexture(scene, barKey, color, barLength, barHeight);

        // Create the attack bar sprite
        this.attackBar = scene.physics.add.sprite(this.x, this.y, barKey);
        this.attackBar.setOrigin(0, 1); // Origin at the bottom
        this.attackBar.depth = this.depth + 1; // Ensure it's rendered above the enemy
        this.attackBar.setVisible(true);
    }

    update(player) {
        // Update attack bar position and rotation based on facing angle
        console.log(this.facingAngle);
        if (this.attackBar) {
            this.attackBar.setRotation(this.facingAngle);
        }
        super.update(player);
    }
}