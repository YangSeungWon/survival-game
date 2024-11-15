import Phaser from 'phaser';
import DepthManager, { DepthLayer } from '../utils/DepthManager';
import GameScene from '../scenes/GameScene';

export default class Heart extends Phaser.Physics.Arcade.Sprite {
    private isCollected: boolean;
    private healAmount: number;
    private magnetRadius: number;
    private magnetSpeed: number;
    private glow: Phaser.GameObjects.Graphics;

    constructor(scene: Phaser.Scene) {
        const textureKey = 'heartTexture';
        if (!scene.textures.exists(textureKey)) {
            const graphics = scene.add.graphics();
            graphics.fillStyle(0x00ff00, 1); // Green color for the heart
            graphics.fillCircle(10, 10, 10); // Draw a circle with radius 10
            graphics.generateTexture(textureKey, 20, 20); // Generate texture with size 20x20
            graphics.destroy();
        }

        super(scene, 0, 0, textureKey);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.setBounce(1);
        this.setImmovable(true);
        this.setCircle(10); // Adjust the size as needed

        // Initialize collected state
        this.isCollected = false;
        this.healAmount = 0;

        // Initialize magnet properties
        this.magnetRadius = 100; // The radius within which the heart is attracted to the player
        this.magnetSpeed = 500;   // The speed at which it moves toward the player

        // Initialize glow effect
        this.glow = scene.add.graphics({ x: this.x, y: this.y });
        this.glow.setDepth(this.depth + 1);
        this.glow.setVisible(false);
        this.drawGlow();
    }

    /**
     * Initializes the heart with specific properties.
     * @param x - X position.
     * @param y - Y position.
     * @param healAmount - The amount of health this heart restores.
     */
    initialize(x: number, y: number, healAmount: number): void {
        this.setPosition(x, y);
        this.setActive(true);
        this.setVisible(true);
        this.isCollected = false;
        this.healAmount = healAmount; // Store the heal amount
        this.glow.setPosition(x, y);
    }

    setHealAmount(healAmount: number): void {
        this.healAmount = healAmount;
    }

    /**
     * Draws the glow effect around the heart.
     */
    private drawGlow(): void {
        const glowRadius = 20; // Adjust the size of the glow
        this.glow.clear();
        this.glow.fillStyle(0x00ff00, 0.5); // Green color with 50% opacity
        this.glow.fillCircle(0, 0, glowRadius);
    }

    /**
     * Update method called every frame.
     */
    update(): void {
        if (this.isCollected) return;

        const player = (this.scene as GameScene).player;
        if (!player) return;

        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        if (distance <= this.magnetRadius) {
            // Calculate direction towards player
            const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);

            // Smooth velocity calculation
            const speedFactor = Phaser.Math.Clamp((this.magnetRadius - distance) / this.magnetRadius, 0, 1);
            const velocityX = Math.cos(angle) * this.magnetSpeed * speedFactor;
            const velocityY = Math.sin(angle) * this.magnetSpeed * speedFactor;

            this.setVelocity(velocityX, velocityY);

            // Show glow effect
            if (!this.glow.visible) {
                this.glow.setVisible(true);
            }

            // Optional: Add pulsating effect to the glow
            const scale = 1 + 0.3 * Math.sin(this.scene.time.now / 200);
            this.glow.setScale(scale);
        } else {
            // If not attracted, stop movement
            this.setVelocity(0, 0);

            // Hide glow effect
            if (this.glow.visible) {
                this.glow.setVisible(false);
            }

            // Reset glow scale
            this.glow.setScale(1);
        }

        // Update glow position
        this.glow.setPosition(this.x, this.y);
    }

    /**
     * Handles the collection of the heart by the player.
     */
    collect(): void {
        if (!this.isCollected) {
            this.isCollected = true;
            this.setActive(false);
            this.setVisible(false);
            this.glow.setVisible(false);
            this.scene.events.emit('heartCollected', this.healAmount); // Emit heal amount
            this.destroy();
        }
    }

    /**
     * Ensures the glow graphic is destroyed when the heart is removed.
     */
    destroy(fromScene?: boolean): void {
        this.glow.destroy();
        super.destroy(fromScene);
    }
}
