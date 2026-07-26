import Phaser from 'phaser';
import GameScene from './GameScene';
import { pageHref } from '../utils/locale';
import { t } from '../utils/i18n';

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        // Load necessary assets
        this.load.image('startButton', 'assets/start.webp');
        // Load other assets as needed

        // 동적으로 파티클 텍스처 생성
        const colors: { [key: string]: number } = {
            red: 0xff0000,
            blue: 0x00ffff,
            green: 0x00ff00,
            yellow: 0xffff00
        };
        for (const [key, color] of Object.entries(colors)) {
            const graphics = this.make.graphics({ x: 0, y: 0 });
            graphics.fillStyle(color, 1);
            graphics.fillCircle(8, 8, 8); // 반지름 8의 원을 그림
            graphics.generateTexture(`particle_${key}`, 16, 16);
            graphics.destroy();
        }
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


        // Optionally, add a title or other UI elements
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 100, 'Survival Game', {
            fontSize: '72px',
            color: '#ffffff',
            fontFamily: '"Noto Sans", sans-serif'
        }).setOrigin(0.5).setStroke('#000000', 10);

        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 100, t('clickToPlay'), {
            fontSize: '36px',
            color: '#ffffff',
            fontFamily: '"Noto Sans", sans-serif'
        }).setOrigin(0.5).setStroke('#000000', 5);

        this.input.on('pointerdown', () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);

            this.cameras.main.on('camerafadeoutcomplete', () => {
                this.scene.start('GameScene');
            });
        });

        this.input.keyboard?.once('keydown', () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);

            this.cameras.main.on('camerafadeoutcomplete', () => {
                this.scene.start('GameScene');
            });
        });

        // Add How to Play Button — static HTML guide (howto.html), which now
        // covers the enemy and power-up/attack reference too.
        const howToButton = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 200, t('howToPlay'), {
            fontSize: '32px',
            color: '#ffffff',
            backgroundColor: '#0000ef',
            padding: { x: 20, y: 10 },
            fontFamily: '"Noto Sans", sans-serif'
        })
        .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                window.location.href = pageHref('howto.html');
            });

        // Add Records (leaderboard) Button — a static HTML page (records.html)
        const recordsButton = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 270, t('records'), {
            fontSize: '32px',
            color: '#000000',
            backgroundColor: '#ffd700',
            padding: { x: 20, y: 10 },
            fontFamily: '"Noto Sans", sans-serif'
        })
        .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                window.location.href = pageHref('records.html');
            });
    }
}
