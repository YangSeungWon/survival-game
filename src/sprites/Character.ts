import Phaser from 'phaser';
import GameScene from '../scenes/GameScene';
import Attack from '../attacks/Attack';
import { StatusEffect } from '../attacks/Attack';

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
    statusEffects: Map<string, StatusEffect> = new Map();
    paused: boolean = false;

    // Particle emitters for status effects
    private fireParticles?: Phaser.GameObjects.Particles.ParticleEmitter;
    private iceParticles?: Phaser.GameObjects.Particles.ParticleEmitter;
    private poisonParticles?: Phaser.GameObjects.Particles.ParticleEmitter;
    private stunParticles?: Phaser.GameObjects.Particles.ParticleEmitter;

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
     * Updates the duration only if the status effect IDs match exactly.
     * @param id - Unique identifier for the status effect.
     * @param effect - The status effect to apply.
     */
    applyStatusEffect(effect: StatusEffect): void {
        if (!this.scene) return;

        const existingEffect = this.statusEffects.get(effect.id);

        if (existingEffect) {
            // Update duration if the IDs match exactly
            existingEffect.duration = effect.duration;
            // Optionally, reset other properties if needed
            existingEffect.tickRate = effect.tickRate;
            // You can update other properties as required
            return;
        }

        this.enterStatusEffect(effect);
        const copiedEffect = {
            ...effect,
            lastTick: 0,
        };
        this.statusEffects.set(effect.id, copiedEffect);
    }

    enterStatusEffect(effect: StatusEffect): void {
        switch (effect.type) {
            case 'burn':
                this.addBurnParticles();
                this.setTintFill(0xff0000);
                break;
            case 'freeze':
                this.moveSpeed *= 0.7;
                this.setTintFill(0x00ffff);
                this.addFreezeParticles();
                break;
            case 'poison':
                this.addPoisonParticles();
                this.setTintFill(0x00ff00);
                break;
            case 'stun':
                this.addStunParticles();
                this.canMove = false;
                this.canAttack = false;
                this.setTintFill(0xffff00);
                break;
            default:
                console.warn(`Unknown status effect type: ${effect.type}`);
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
                this.removeBurnParticles();
                break;
            case 'freeze':
                this.moveSpeed /= 0.7;
                this.removeFreezeParticles();
                break;
            case 'poison':
                this.removePoisonParticles();
                break;
            case 'stun':
                this.canMove = true;
                this.canAttack = true;
                this.removeStunParticles();
                break;
            default:
                console.warn(`Unknown status effect: ${effectType}`);
        }
        this.clearTint();
    }

    /**
     * Updates active status effects.
     * Should be called in the update loop of the subclass.
     * @param delta - Time elapsed since the last frame in milliseconds.
     */
    updateStatusEffects(delta: number): void {
        if (this.paused) return;

        this.statusEffects.forEach((effect, id) => {
            effect.duration -= delta;
            if (!effect.lastTick) effect.lastTick = 0;
            effect.lastTick += delta; // Update the last tick time

            // Apply effect logic only if tickRate is defined and enough time has passed
            if (effect.tickRate && effect.lastTick >= effect.tickRate) {
                this.applyEffectLogic(effect.type, effect.tickRate);
                effect.lastTick = 0; // Reset the last tick
            }

            if (effect.duration <= 0) {
                this.handleStatusEffectEnd(effect.type);
                this.statusEffects.delete(id);
            }
        });
    }

    abstract handleHealthChanged(amount: number): void;

    /**
     * Defines the logic for each status effect.
     * @param effectType - The type of status effect.
     * @param delta - Time elapsed since the last tick in milliseconds.
     */
    protected applyEffectLogic(effectType: string, delta: number): void {
        switch (effectType) {
            case 'burn':
                const burnDamage = (this.maxHealth * 0.04);
                this.takeDamage(burnDamage);
                break;

            case 'freeze':
                break;

            case 'poison':
                const poisonDamage = (this.health * 0.08);
                this.takeDamage(poisonDamage);
                break;

            case 'stun':
                break;

            default:
                console.warn(`Unknown status effect logic: ${effectType}`);
        }
    }

    private addBurnParticles(): void {
        if (this.fireParticles) return; // Prevent multiple emitters
        this.fireParticles = this.scene.add.particles(this.x, this.y, 'particle_red', {
            lifespan: 200,
            speed: { min: 40, max: 80 },
            scale: { start: 0.3, end: 0 },
            blendMode: 'ADD',
            emitZone: { source: new Phaser.Geom.Circle(0, 0, 10), type: 'edge', quantity: 10 }
        });
        this.fireParticles.setDepth(2);
    }

    private addFreezeParticles(): void {
        if (this.iceParticles) return;

        this.iceParticles = this.scene.add.particles(this.x, this.y, 'particle_blue', {
            lifespan: 200,
            speed: { min: 40, max: 80 },
            scale: { start: 0.3, end: 0 },
            alpha: { start: 0.6, end: 0 },
            emitZone: { source: new Phaser.Geom.Circle(0, 0, 15), type: 'edge', quantity: 15 }
        });
        this.iceParticles.setDepth(2);
    }

    private addPoisonParticles(): void {
        if (this.poisonParticles) return;

        this.poisonParticles = this.scene.add.particles(this.x, this.y, 'particle_green', {
            lifespan: 200,
            speed: { min: 30, max: 60 },
            scale: { start: 0.4, end: 0 },
            alpha: { start: 0.7, end: 0 },
            emitZone: { source: new Phaser.Geom.Circle(0, 0, 12), type: 'edge', quantity: 12 }
        });
        this.poisonParticles.setDepth(2);
    }

    private addStunParticles(): void {
        if (this.stunParticles) return;

        this.stunParticles = this.scene.add.particles(this.x, this.y, 'particle_yellow', {
            lifespan: 200,
            speed: 100,
            scale: { start: 0.4, end: 0 },
            rotate: { start: 0, end: 360 },
            frequency: 100,
            emitZone: { source: new Phaser.Geom.Rectangle(-10, -10, 20, 20), type: 'edge', quantity: 5 }
        });
        this.stunParticles.setDepth(2);
    }

    private removeBurnParticles(): void {
        if (this.fireParticles) {
            this.fireParticles.stop();
            this.fireParticles = undefined;
        }
    }

    private removeFreezeParticles(): void {
        if (this.iceParticles) {
            this.iceParticles.stop();
            this.iceParticles = undefined;
        }
    }

    private removePoisonParticles(): void {
        if (this.poisonParticles) {
            this.poisonParticles.stop();
            this.poisonParticles = undefined;
        }
    }

    private removeStunParticles(): void {
        if (this.stunParticles) {
            this.stunParticles.stop();
            this.stunParticles = undefined;
        }
    }

    takeDamage(amount: number): number {
        const ceiledAmount = Math.ceil(amount);

        const initialHealth = this.health;
        this.health = Math.max(this.health - ceiledAmount, 0); // Ensure health doesn't go below zero

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

        this.handleHealthChanged(-damageDealt);

        return damageDealt;
    }

    destroy(fromScene?: boolean): void {
        // Clean up all particle emitters
        this.removeBurnParticles();
        this.removeFreezeParticles();
        this.removePoisonParticles();
        this.removeStunParticles();

        this.attacks.forEach(attack => {
            attack.destroy();
        });
        super.destroy(fromScene);
    }

    pause(): void {
        this.paused = true;
    }

    resume(): void {
        this.paused = false;
    }

    // Method to remove a status effect
    private removeStatusEffect(effect: StatusEffect): void {
        switch (effect.type) {
            case 'burn':
                this.removeBurnParticles();
                break;
            case 'freeze':
                this.removeFreezeParticles();
                break;
            case 'poison':
                this.removePoisonParticles();
                break;
            case 'stun':
                this.removeStunParticles();
                break;
            default:
                console.warn(`Unknown status effect: ${effect}`);
        }
    }
}
