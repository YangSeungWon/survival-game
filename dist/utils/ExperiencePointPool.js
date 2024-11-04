import ExperiencePoint from '../sprites/ExperiencePoint';
export default class ExperiencePointPool {
    constructor(scene, poolSize = -1) {
        this.scene = scene;
        this.points = scene.physics.add.group({
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
        scene.events.on('experienceCollected', this.addPlayerExperience, this);
    }
    /**
     * Spawns an experience point at the specified location.
     * @param {number} x - X position.
     * @param {number} y - Y position.
     * @param {number} experienceAmount - The amount of experience this point gives.
     */
    spawnExperience(x, y, experienceAmount) {
        let experience = this.points.getFirstDead(false);
        if (!experience) {
            experience = new ExperiencePoint(this.scene);
        }
        experience.initialize(x, y, experienceAmount);
        this.points.add(experience);
    }
    /**
     * Optional: Handle adding experience to the player.
     * @param {number} amount - Amount of experience to add.
     */
    addPlayerExperience(amount) {
        // Emit an event to handle experience addition elsewhere
        this.scene.events.emit('experiencePointCollected', amount);
    }
    getPoints() {
        return this.points;
    }
}
//# sourceMappingURL=ExperiencePointPool.js.map