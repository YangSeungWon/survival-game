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
    private shareButton!: Phaser.GameObjects.Text;
    private shareToTwitterButton!: Phaser.GameObjects.Text;

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
            color: '#ff0000',
            backgroundColor: '#ffffff',
            padding: { x: 20, y: 10 },
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.retryGame());

        // Add share to twitter button
        this.shareToTwitterButton = this.add.text(this.cameras.main.centerX, this.cameras.main.height - 220, 'Share to Twitter', {
            fontSize: '32px',
            color: '#0000ff',
            backgroundColor: '#ffffff',
            padding: { x: 20, y: 10 },
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.shareToTwitter());

        // Add share button
        this.shareButton = this.add.text(this.cameras.main.centerX, this.cameras.main.height - 160, 'Share', {
            fontSize: '32px',
            color: '#0000ff',
            backgroundColor: '#ffffff',
            padding: { x: 20, y: 10 },
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.shareResultWithScreenshot());

        // Position retry and share buttons
        this.retryButton.setY(this.cameras.main.height - 100);
        this.shareButton.setY(this.cameras.main.height - 160);
        this.shareToTwitterButton.setY(this.cameras.main.height - 220);
    }

    update(time: number, delta: number) {
        // Update logic if necessary
    }

    private retryGame() {
        window.location.reload();
    }

    private shareResult() {
        const shareData = {
            title: '[Survival Game]',
            text: this.getShareText(),
            url: 'https://survival.game.ysw.kr',
        };

        if (navigator.share) {
            navigator.share(shareData)
                .then(() => {
                    console.log('Game result shared successfully.');
                })
                .catch((error) => {
                    console.error('Error sharing:', error);
                });
        } else {
            const shareText = `${shareData.text}\nPLAY NOW: ${shareData.url}`;
            navigator.clipboard.writeText(shareText)
                .then(() => {
                    this.showCopySuccessMessage();
                })
                .catch((error) => {
                    console.error('Failed to copy text:', error);
                });
        }
    }

    private getShareText(): string {
        const { level, time, experience, isSuccess, powerUps } = this.resultData;
        const resultMessage = '[Survival Game Result]\n' + (isSuccess ? 'I won!' : 'I was defeated.');
        const formattedTime = this.formatTime(time);
        const powerUpsText = powerUps.length > 0 ? powerUps.join(', ') : 'No power-ups';

        return `${resultMessage}\nLevel: ${level}\nTime: ${formattedTime}\nExperience: ${experience}\nPower-Ups: ${powerUpsText}\n`;
    }

    private showCopySuccessMessage() {
        const message = this.add.text(this.cameras.main.centerX, this.cameras.main.height - 200, 'Share text copied to clipboard!', {
            fontSize: '20px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 },
        })
            .setOrigin(0.5)
            .setAlpha(0);

        this.tweens.add({
            targets: message,
            alpha: 1,
            duration: 500,
            ease: 'Power1',
            yoyo: true,
            hold: 2000,
            onComplete: () => message.destroy(),
        });
    }

    private formatTime(milliseconds: number): string {
        const seconds = Math.floor(milliseconds / 1000);
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    private async shareResultWithScreenshot() {
        try {
            // 결과 창 스크린샷 가져오기
            const screenshot = this.resultData.screenshot;
            const shareData: ShareData = {
                title: '[Survival Game Result]',
                text: this.getShareText(),
                files: [
                    new File([screenshot], 'game_result.png', { type: 'image/png' })
                ],
                url: 'https://survival.game.ysw.kr',
            };
    
            if (navigator.canShare && navigator.canShare({ files: shareData.files })) {
                await navigator.share(shareData);
                console.log('Game result and screenshot shared successfully.');
            } else {
                throw new Error('File sharing is not supported in this browser.');
            }
        } catch (error) {
            console.error('Error sharing screenshot:', error);
            this.shareResult(); // Fallback으로 텍스트 공유
        }
    }
    private async shareToTwitter() {
        try {
            const screenshot = this.resultData.screenshot;
            const shareText = encodeURIComponent(this.getShareText());
            const shareURL = encodeURIComponent('https://survival.game.ysw.kr');
            const twitterURL = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareURL}`;
            console.log(twitterURL);
            // First try to share with the screenshot
            const shareData: ShareData = {
                title: '[Survival Game Result]',
                text: this.getShareText(),
                files: [
                    new File([screenshot], 'game_result.png', { type: 'image/png' })
                ],
                url: shareURL
            };
            console.log(shareData);

            if (navigator.canShare && navigator.canShare({ files: shareData.files })) {
                await navigator.share(shareData);
                console.log('Game result and screenshot shared to Twitter successfully.');
            } else {
                // Fallback to regular Twitter share if file sharing not supported
                window.open(twitterURL, '_blank');
            }
        } catch (error) {
            console.error('Error sharing to Twitter:', error);
            // Fallback to regular Twitter share on error
            const shareText = encodeURIComponent(this.getShareText());
            const shareURL = encodeURIComponent('https://survival.game.ysw.kr');
            const twitterURL = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareURL}`;
            window.open(twitterURL, '_blank');
        }
    }
}