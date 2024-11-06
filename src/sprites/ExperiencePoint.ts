import Phaser from 'phaser';
import GameScene from '../scenes/GameScene';

export default class ExperiencePoint extends Phaser.Physics.Arcade.Sprite {
    private isCollected: boolean;
    private experienceAmount: number;
    private magnetRadius: number;
    private magnetSpeed: number;
    private glow: Phaser.GameObjects.Graphics;

    constructor(scene: Phaser.Scene) {
        super(scene, 0, 0, 'experienceTexture');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.setBounce(1);
        this.setImmovable(true);
        this.setCircle(5); // Adjust the size as needed

        // Initialize collected state
        this.isCollected = false;
        this.experienceAmount = 0;

        // Initialize magnet properties
        this.magnetRadius = 100; // The radius within which the experience point is attracted to the player
        this.magnetSpeed = 150;   // The speed at which it moves toward the player

        // Initialize glow effect
        this.glow = scene.add.graphics({ x: this.x, y: this.y });
        this.glow.setDepth(this.depth + 1);
        this.glow.setVisible(false);
        this.drawGlow();
    }

    /**
     * Initializes the experience point with specific properties.
     * @param x - X position.
     * @param y - Y position.
     * @param experienceAmount - The amount of experience this point gives.
     */
    initialize(x: number, y: number, experienceAmount: number): void {
        this.setPosition(x, y);
        this.setActive(true);
        this.setVisible(true);
        this.isCollected = false;
        this.experienceAmount = experienceAmount; // Store the experience amount
        this.glow.setPosition(x, y);
    }

    setExperienceAmount(experienceAmount: number): void {
        this.experienceAmount = experienceAmount;
    }

    /**
     * Draws the glow effect around the experience point.
     */
    private drawGlow(): void {
        const glowRadius = 15; // Adjust the size of the glow
        this.glow.clear();
        this.glow.fillStyle(0xffff00, 0.5); // Yellow color with 50% opacity
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

            // Increase speed as the distance decreases
            const speedFactor = (this.magnetRadius - distance) / this.magnetRadius;
            const velocityX = Math.cos(angle) * this.magnetSpeed * (1 + speedFactor);
            const velocityY = Math.sin(angle) * this.magnetSpeed * (1 + speedFactor);

            this.setVelocity(velocityX, velocityY);

            // Show glow effect
            if (!this.glow.visible) {
                this.glow.setVisible(true);
            }
        } else {
            // If not attracted, stop movement
            this.setVelocity(0, 0);

            // Hide glow effect
            if (this.glow.visible) {
                this.glow.setVisible(false);
            }
        }

        // Update glow position
        this.glow.setPosition(this.x, this.y);
    }

    /**
     * Handles the collection of the experience point by the player.
     */
    collect(): void {
        if (!this.isCollected) {
            this.isCollected = true;
            this.setActive(false);
            this.setVisible(false);
            this.glow.setVisible(false);
            this.scene.events.emit('experienceCollected', this.experienceAmount); // Use the stored experience amount
            this.destroy();
        }
    }

    /**
     * Ensures the glow graphic is destroyed when the experience point is removed.
     */
    destroy(fromScene?: boolean): void {
        this.glow.destroy();
        super.destroy(fromScene);
    }
}
