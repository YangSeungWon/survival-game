import { createAttackBarTexture } from '../utils/TextureGenerator.js';

export default class Attack {
    /**
     * @param {Phaser.Scene} scene - The current scene.
     * @param {enemy or player} owner - The owner of the attack.
     * @param {Object} config - Configuration for the attack.
     * @param {number} config.attackRange - The range of the attack.
     * @param {number} config.attackSpeed - Delay between attacks in milliseconds.
     * @param {number} config.attackPower - Damage dealt by the melee attack.
     */
    constructor(scene, owner, config) {
        this.scene = scene;
        this.owner = owner;
        this.attackRange = config.attackRange;
        this.attackSpeed = config.attackSpeed;
        this.attackPower = config.attackPower;

        this.isAttacking = false;

        this.attackBar = null;
        this.initAttackBar(scene, this.attackRange, this.attackPower);
    }

    initAttackBar(scene, barLength, barHeight) {
        const barKey = `attackBar_${this.constructor.name}_${this.owner.color}_${barLength}_${barHeight}`;

        // Create the attack bar texture
        createAttackBarTexture(scene, barKey, this.owner.color, barLength, barHeight);

        // Create the attack bar sprite
        this.attackBar = scene.physics.add.sprite(this.owner.x, this.owner.y, barKey);
        this.attackBar.setOrigin(0, 1); // Origin at the bottom
        this.attackBar.depth = this.owner.depth + 1; // Ensure it's rendered above the enemy
        this.attackBar.setVisible(true);
    }

    updateAttackBar() {
        this.attackBar.setPosition(this.owner.x, this.owner.y);
        if (!this.isAttacking) {
            this.attackBar.setRotation(this.owner.facingAngle);
        }
    }

    performAttack() {
        throw new Error('performAttack() method must be implemented by subclass');
    }

    /**
     * Destroy the attack and clean up resources.
     */
    destroy() {
        // Optional: Override in subclasses if additional cleanup is needed
    }
}
