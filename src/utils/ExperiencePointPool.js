import ExperiencePoint from '../sprites/ExperiencePoint.js';

export default class ExperiencePointPool {
    constructor(scene, poolSize = 50) {
        this.scene = scene;
        this.pool = scene.physics.add.group({
            classType: ExperiencePoint,
            maxSize: poolSize,
            runChildUpdate: true
        });

        // Create experience point texture if it doesn't exist
        if (!scene.textures.exists('experienceTexture')) {
            const graphics = scene.add.graphics();
            graphics.fillStyle(0xffd700, 1); // Gold color
            graphics.fillCircle(5, 5, 5); // Adjust size as needed
            graphics.generateTexture('experienceTexture', 10, 10);
            graphics.destroy();
        }

        // Listen to collection events
        scene.events.on('experienceCollected', this.addExperience, this);
    }

    /**
     * Spawns an experience point at the specified location.
     * @param {number} x - X position.
     * @param {number} y - Y position.
     * @param {number} experienceAmount - The amount of experience this point gives.
     */
    spawnExperience(x, y, experienceAmount) {
        let experience = this.pool.getFirstDead(false);
        if (!experience) {
            experience = new ExperiencePoint(this.scene, x, y);
            experience.experienceAmount = experienceAmount;
            this.pool.add(experience);
        } else {
            experience.initialize(x, y, experienceAmount);
        }
    }

    /**
     * Optional: Handle adding experience to the player.
     * @param {number} amount - Amount of experience to add.
     */
    addExperience(amount) {
        // Implement how the player's experience is handled
        if (this.scene.player) {
            this.scene.player.addExperience(amount);
        }
    }
}
