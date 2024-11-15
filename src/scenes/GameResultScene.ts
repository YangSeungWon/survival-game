import Phaser from 'phaser';
import GameScene from './GameScene';

interface GameResultData {
    level: number;
    time: number;
    experience: number;
    isSuccess: boolean;
    powerUps: string[];
    screenshot: string;
}

export default class GameResultScene extends Phaser.Scene {
    private resultData!: GameResultData;
    private background!: Phaser.GameObjects.Image;
    private resultText!: Phaser.GameObjects.Text;
    private retryButton!: Phaser.GameObjects.Text;

    constructor() {
        super({ key: 'GameResultScene' });
    }

    init(data: { resultData: GameResultData }) {
        this.resultData = data.resultData;
    }

    preload() {
        // Load any necessary assets
        this.load.image('background', this.resultData.screenshot);
    }

    create() {
        // Add background image
        this.background = this.add.image(0, 0, 'background').setOrigin(0);
        this.background.displayWidth = this.cameras.main.width;
        this.background.displayHeight = this.cameras.main.height;

        // Display result text
        const resultMessage = this.resultData.isSuccess ? 'You Win!' : 'Game Over';
        this.resultText = this.add.text(this.cameras.main.centerX, 100, resultMessage, {
            fontSize: '48px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Display level, time, and experience
        this.add.text(50, 200, `Level: ${this.resultData.level}`, { fontSize: '24px', color: '#ffffff' });
        this.add.text(50, 230, `Time: ${this.formatTime(this.resultData.time)}`, { fontSize: '24px', color: '#ffffff' });
        this.add.text(50, 260, `Experience: ${this.resultData.experience}`, { fontSize: '24px', color: '#ffffff' });

        // Display power-ups
        this.add.text(50, 290, 'Power-Ups:', { fontSize: '20px', color: '#ffffff' });
        this.resultData.powerUps.forEach((powerUp, index) => {
            this.add.text(100, 320 + index * 25, `• ${powerUp}`, { fontSize: '16px', color: '#ffffff' });
        });

        // Add retry button
        this.retryButton = this.add.text(this.cameras.main.centerX, this.cameras.main.height - 100, 'Retry', {
            fontSize: '32px',
            color: '#00ff00',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 },
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.retryGame());
    }

    update(time: number, delta: number) {
        // Update logic if necessary
    }

    private retryGame() {
        window.location.reload();
    }

    private formatTime(milliseconds: number): string {
        const seconds = Math.floor(milliseconds / 1000);
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
}
    