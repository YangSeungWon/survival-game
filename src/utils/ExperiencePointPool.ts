import Phaser from 'phaser';
import ExperiencePoint from '../sprites/ExperiencePoint';
import DepthManager, { DepthLayer } from './DepthManager';
import GameScene from '../scenes/GameScene';

export default class ExperiencePointPool {
    private scene: Phaser.Scene;
    private points: Phaser.Physics.Arcade.Group;

    constructor(scene: Phaser.Scene, poolSize: number = -1) {
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
    public spawnExperience(x: number, y: number, experienceAmount: number): void {
        let experience = this.points.getFirstDead(false) as ExperiencePoint;
        if (!experience) {
            experience = new ExperiencePoint(this.scene);
            experience.setDepth(DepthManager.getInstance().getDepth(DepthLayer.EFFECT));
        }
        experience.initialize(x, y, experienceAmount);
        this.points.add(experience);
    }

    /**
     * Optional: Handle adding experience to the player.
     * @param {number} amount - Amount of experience to add.
     */
    public addPlayerExperience(amount: number): void {
        (this.scene as GameScene).coinSound?.play();
        // Emit an event to handle experience addition elsewhere
        this.scene.events.emit('experiencePointCollected', amount);
    }

    public getPoints(): Phaser.Physics.Arcade.Group {
        return this.points;
    }

    public clear(): void {
        while (this.points.getChildren().length > 0) {
            const experience = this.points.getChildren()[0] as ExperiencePoint;
            experience.remove();
            this.points.remove(experience);
        }
    }
}
