import Phaser from 'phaser';
import GameScene from './GameScene';

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        // Load necessary assets
        this.load.image('startButton', 'assets/start.webp');
        // Load other assets as needed
    }

    create() {
        // Add background or any preload-related visuals if necessary

        // Add Start Button
        const startButton = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'startButton')
            .setInteractive()
            .setScale(1);

        // Add hover effects
        startButton.on('pointerover', () => {
            startButton.setScale(1.1);
        });

        startButton.on('pointerout', () => {
            startButton.setScale(1);
        });

        // Start the GameScene on click
        startButton.on('pointerdown', () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);

            this.cameras.main.on('camerafadeoutcomplete', () => {
                this.scene.start('GameScene');
            });
        });

        // Optionally, add a title or other UI elements
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 100, 'Survival Game', {
            fontSize: '72px',
            color: '#ffffff',
            fontFamily: '"Noto Sans", sans-serif'
        }).setOrigin(0.5).setStroke('#000000', 10);

        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 100, 'Click Anywhere to Play', {
            fontSize: '36px',
            color: '#ffffff',
            fontFamily: '"Noto Sans", sans-serif'
        }).setOrigin(0.5).setStroke('#000000', 5);

        
    }
}
