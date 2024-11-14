import Phaser from 'phaser';
import DepthManager, { DepthLayer } from '../utils/DepthManager';

export default class Heart extends Phaser.Physics.Arcade.Sprite {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        const textureKey = 'heartTexture';
        if (!scene.textures.exists(textureKey)) {
            const graphics = scene.add.graphics();
            graphics.fillStyle(0xccffcc, 1); // Green color for the heart
            graphics.fillCircle(10, 10, 10); // Draw a circle with radius 10
            graphics.generateTexture(textureKey, 20, 20); // Generate texture with size 20x20
            graphics.destroy();
        }

        super(scene, x, y, textureKey);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setCollideWorldBounds(true);
        this.setDepth(DepthManager.getInstance().getDepth(DepthLayer.EFFECT));
    }

    collect(): void {
        this.destroy();
    }
}
