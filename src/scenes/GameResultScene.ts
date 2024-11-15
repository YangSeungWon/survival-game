import Phaser from 'phaser';
import GameScene from './GameScene';
import share from '../utils/share';

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
    private shareButton!: Phaser.GameObjects.Text;

    constructor() {
        super({ key: 'GameResultScene' });
    }

    init(data: { resultData: GameResultData }) {
        this.resultData = data.resultData;
    }

    preload() {
        // Load necessary assets
        this.load.image('background', this.resultData.screenshot);
    }

    create() {
        // 배경 이미지 추가
        this.background = this.add.image(0, 0, 'background').setOrigin(0);
        this.background.displayWidth = this.cameras.main.width;
        this.background.displayHeight = this.cameras.main.height;

        // 결과 텍스트 표시
        const resultMessage = this.resultData.isSuccess ? 'You Win!' : 'Game Over';
        this.resultText = this.add.text(this.cameras.main.centerX, 100, resultMessage, {
            fontSize: '48px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // 레벨, 시간, 경험치 표시
        this.add.text(50, 200, `Level: ${this.resultData.level}`, { fontSize: '24px', color: '#ffffff' });
        this.add.text(50, 230, `Time: ${this.formatTime(this.resultData.time)}`, { fontSize: '24px', color: '#ffffff' });
        this.add.text(50, 260, `Experience: ${this.resultData.experience}`, { fontSize: '24px', color: '#ffffff' });

        // 파워업 표시
        this.add.text(50, 290, 'Power-Ups:', { fontSize: '20px', color: '#ffffff' });
        this.resultData.powerUps.forEach((powerUp, index) => {
            this.add.text(100, 320 + index * 25, `• ${powerUp}`, { fontSize: '16px', color: '#ffffff' });
        });

        // 리트라이 버튼 추가
        this.retryButton = this.add.text(this.cameras.main.centerX, this.cameras.main.height - 100, 'Retry', {
            fontSize: '32px',
            color: '#ffffff',
            backgroundColor: '#0000ef',
            padding: { x: 20, y: 10 },
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.retryGame());

        // 일반 공유 버튼 추가
        this.shareButton = this.add.text(this.cameras.main.centerX, this.cameras.main.height - 160, 'Share', {
            fontSize: '32px',
            color: '#0000ef',
            backgroundColor: '#ffffff',
            padding: { x: 20, y: 10 },
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.shareResult());

        // 스크린샷 다운로드 버튼 추가
        const downloadScreenshotButton = this.add.text(this.cameras.main.centerX, this.cameras.main.height - 220, 'Download Screenshot', {
            fontSize: '32px',
            color: '#000000',
            backgroundColor: '#ffffff',
            padding: { x: 20, y: 10 },
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.downloadScreenshot());

        // 버튼 위치 조정
        this.retryButton.setY(this.cameras.main.height - 100);
        this.shareButton.setY(this.cameras.main.height - 160);
        downloadScreenshotButton.setY(this.cameras.main.height - 220);
    }

    update(time: number, delta: number) {
        // 필요한 업데이트 로직
    }

    private retryGame() {
        window.location.reload();
    }

    private async shareResult() {
        // Fetch the screenshot as a Blob
        const response = await fetch(this.resultData.screenshot);
        const blob = await response.blob();

        // Create a File from the Blob
        const file = new File([blob], 'screenshot.jpg', { type: blob.type });

        const shareData = {
            title: '[Survival Game]',
            text: this.getShareText(),
            url: 'https://survival.game.ysw.kr',
            files: [file],
        };

        const isShared = await share(shareData);
        if (isShared === 'shared' || isShared === 'copiedToClipboard') {
            this.showCopySuccessMessage('Share text copied to clipboard!');
        } else {
            this.showCopySuccessMessage('Failed to copy share text.', true);
        }
    }

    private getShareText(): string {
        const { level, time, experience, isSuccess, powerUps } = this.resultData;
        const resultMessage = '[Survival Game Result]\n' + (isSuccess ? 'I won!' : 'I was defeated.');
        const formattedTime = this.formatTime(time);
        const powerUpsText = powerUps.length > 0 ? powerUps.join(', ') : 'No power-ups';

        return `${resultMessage}\nLevel: ${level}\nTime: ${formattedTime}\nExperience: ${experience}\nPower-Ups: ${powerUpsText}\n`;
    }

    private showCopySuccessMessage(message: string, isError: boolean = false) {
        const color = isError ? '#ff0000' : '#00ff00';
        const msg = this.add.text(this.cameras.main.centerX, this.cameras.main.height - 250, message, {
            fontSize: '20px',
            color: color,
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 },
        })
            .setOrigin(0.5)
            .setAlpha(0);

        this.tweens.add({
            targets: msg,
            alpha: 1,
            duration: 500,
            ease: 'Power1',
            yoyo: true,
            hold: 2000,
            onComplete: () => msg.destroy(),
        });
    }

    private formatTime(milliseconds: number): string {
        const seconds = Math.floor(milliseconds / 1000);
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    /**
     * 스크린샷 다운로드 메서드
     */
    private downloadScreenshot() {
        const link = document.createElement('a');
        link.href = this.resultData.screenshot;
        link.download = `screenshot_level_${this.resultData.level}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}