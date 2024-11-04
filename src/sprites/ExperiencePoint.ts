import Phaser from 'phaser';

export default class ExperiencePoint extends Phaser.Physics.Arcade.Sprite {
    private isCollected: boolean;
    private experienceAmount: number;

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
    }

    setExperienceAmount(experienceAmount: number): void {
        this.experienceAmount = experienceAmount;
    }

    /**
     * Handles the collection of the experience point by the player.
     */
    collect(): void {
        if (!this.isCollected) {
            this.isCollected = true;
            this.setActive(false);
            this.setVisible(false);
            this.scene.events.emit('experienceCollected', this.experienceAmount); // Use the stored experience amount
            this.destroy();
        }
    }
}
