import Phaser from 'phaser';
export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }
    preload() {
        this.load.image('start', 'assets/start.webp');
    }
    create() {
        this.scene.start('GameScene');
    }
}
//# sourceMappingURL=PreloadScene.js.map