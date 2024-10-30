export default class ExperiencePoint extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'experienceTexture');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.setBounce(1);
        this.setImmovable(true);
        this.setCircle(5); // Adjust the size as needed

        // Initialize collected state
        this.isCollected = false;
    }

    /**
     * Initializes the experience point with specific properties.
     * @param {number} x - X position.
     * @param {number} y - Y position.
     * @param {number} experienceAmount - The amount of experience this point gives.
     */
    initialize(x, y, experienceAmount) {
        this.setPosition(x, y);
        this.setActive(true);
        this.setVisible(true);
        this.isCollected = false;
        this.experienceAmount = experienceAmount; // Store the experience amount
    }

    /**
     * Handles the collection of the experience point by the player.
     */
    collect() {
        if (!this.isCollected) {
            this.isCollected = true;
            this.setActive(false);
            this.setVisible(false);
            this.scene.events.emit('experienceCollected', this.experienceAmount); // Use the stored experience amount
            this.destroy();
        }
    }
}
