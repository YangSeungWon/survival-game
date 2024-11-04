import Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload(): void {
        this.load.image('start', 'assets/start.webp');
    }

    create(): void {
        this.scene.start('GameScene');
    }
}
