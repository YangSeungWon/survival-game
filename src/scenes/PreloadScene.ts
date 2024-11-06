import Phaser from 'phaser';
import GameScene from './GameScene';

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload(): void {
        const cacheBuster = `?v=${new Date().getTime()}`;
        this.load.image('start', `assets/start.webp${cacheBuster}`);
        // 다른 자산들도 동일하게 적용
    }

    create(): void {
        this.scene.start('GameScene');
    }
}
