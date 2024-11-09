import Phaser from 'phaser';
import GameScene from '../scenes/GameScene';
import Attack from '../attacks/Attack';

interface StatusEffect {
    type: string;
    duration: number; // Duration in milliseconds
}

export default abstract class Character extends Phaser.Physics.Arcade.Sprite {
    scene: GameScene;
    color: number;
    moveSpeed: number;
    health: number;
    maxHealth: number;
    canMove: boolean;
    canAttack: boolean;
    facingAngle: number;
    attacks: Attack[];
    statusEffects: StatusEffect[] = [];

    constructor(
        scene: GameScene,
        x: number,
        y: number,
        texture: string,
        color: number,
        moveSpeed: number,
        health: number
    ) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setCollideWorldBounds(true);
        this.setBounce(1);
        this.setDepth(1);

        this.scene = scene;
        this.color = color;
        this.moveSpeed = moveSpeed;
        this.health = health;
        this.maxHealth = health;
        this.canMove = true;
        this.canAttack = true;
        this.facingAngle = 0;
        this.attacks = [];
    }

    /**
     * Applies a status effect to the character.
     * @param effectType - The type of status effect (e.g., 'burn', 'freeze').
     * @param duration - Duration of the effect in milliseconds.
     */
    applyStatusEffect(effectType: string, duration: number): void {
        // Check if the effect already exists
        const existingEffect = this.statusEffects.find(effect => effect.type === effectType);
        if (existingEffect) {
            // Refresh the duration
            existingEffect.duration = duration;
        } else {
            // Add new status effect
            this.statusEffects.push({ type: effectType, duration });
            this.handleStatusEffectStart(effectType);
        }
    }

    /**
     * Handles the initiation of a status effect.
     * Override this method if specific behavior is needed for certain effects.
     * @param effectType - The type of status effect.
     */
    protected handleStatusEffectStart(effectType: string): void {
        switch (effectType) {
            case 'burn':
                // Example: Start burning effect
                break;
            case 'freeze':
                // Example: Start freezing effect
                break;
            // Add more effects as needed
            default:
                console.warn(`Unknown status effect: ${effectType}`);
        }
    }

    /**
     * Handles the termination of a status effect.
     * Override this method if specific behavior is needed for certain effects.
     * @param effectType - The type of status effect.
     */
    protected handleStatusEffectEnd(effectType: string): void {
        switch (effectType) {
            case 'burn':
                // Example: End burning effect
                break;
            case 'freeze':
                // Example: End freezing effect
                break;
            // Add more effects as needed
            default:
                console.warn(`Unknown status effect: ${effectType}`);
        }
    }

    /**
     * Updates active status effects.
     * Should be called in the update loop of the subclass.
     * @param delta - Time elapsed since the last frame in milliseconds.
     */
    updateStatusEffects(delta: number): void {
        this.statusEffects.forEach(effect => {
            effect.duration -= delta;
            this.applyEffectLogic(effect.type, delta);
        });

        // Remove expired effects
        this.statusEffects = this.statusEffects.filter(effect => {
            if (effect.duration <= 0) {
                this.handleStatusEffectEnd(effect.type);
                return false;
            }
            return true;
        });
    }

    /**
     * Defines the logic for each status effect.
     * @param effectType - The type of status effect.
     * @param delta - Time elapsed since the last frame in milliseconds.
     */
    protected applyEffectLogic(effectType: string, delta: number): void {
        switch (effectType) {
            case 'burn':
                // Apply burn damage over time
                this.health -= 0.05 * delta; // Example: 0.05 damage per millisecond
                if (this.health < 0) this.health = 0;
                this.scene.events.emit('playerHealthChanged', -0.05 * delta);
                break;
            case 'freeze':
                // Example: Reduce move speed or prevent movement
                // Implement as needed
                break;
            // Add more effects as needed
            default:
                console.warn(`Unknown status effect logic: ${effectType}`);
        }
    }


    takeDamage(amount: number): number {
        const initialHealth = this.health;
        this.health = Math.max(this.health - amount, 0); // Ensure health doesn't go below zero

        const damageDealt = initialHealth - this.health; // Calculate the actual damage dealt

        // Flash the player sprite to indicate damage
        this.scene.tweens.add({
            targets: this,
            alpha: 0.5,
            duration: 20,
            yoyo: true,
            repeat: 0,
            onComplete: () => {
                this.alpha = 1; // Ensure alpha is reset to 1
            }
        });

        return damageDealt;
    }

    destroy(fromScene?: boolean): void {
        this.attacks.forEach(attack => {
            attack.destroy();
        });
        super.destroy(fromScene);
    }
}
