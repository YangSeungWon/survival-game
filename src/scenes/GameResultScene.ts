import Phaser from 'phaser';
import GameScene from './GameScene';
import share from '../utils/share';
import copyToClipboard from '../utils/copyToClipboard';
import { RecordEntry, RecordStats } from '../utils/records';
import { pageHref } from '../utils/locale';
import { t, localizePowerUpName } from '../utils/i18n';

interface GameResultData {
    level: number;
    bossHealth?: number;
    bossMaxHealth?: number;
    time: number;
    experience: number;
    isSuccess: boolean;
    powerUps: string[];
    stats: RecordStats;
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
        this.load.json('version', 'version.json');
    }

    create() {
        // 배경 이미지 추가
        this.background = this.add.image(0, 0, 'background').setOrigin(0);
        this.background.displayWidth = this.cameras.main.width;
        this.background.displayHeight = this.cameras.main.height;

        // 결과 텍스트 표시
        const resultMessage = this.resultData.isSuccess ? t('youWin') : t('gameOver');
        this.resultText = this.add.text(this.cameras.main.centerX, 100, resultMessage, {
            fontSize: '48px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // 레벨, 시간, 경험치 표시
        const versionData = this.cache.json.get('version') as { commitHash: string };
        const commitHash = versionData?.commitHash || 'Unknown';
        this.add.text(50, 170, `Commit: ${commitHash}`, { fontSize: '16px', color: '#ffffff' });
        this.add.text(50, 200, `${t('level')}: ${this.resultData.level}`, { fontSize: '24px', color: '#ffffff' });
        this.add.text(50, 230, `${t('time')}: ${this.formatTime(this.resultData.time)}`, { fontSize: '24px', color: '#ffffff' });
        this.add.text(50, 260, `${t('experience')}: ${this.resultData.experience}`, { fontSize: '24px', color: '#ffffff' });
        if (this.resultData.bossHealth) {
            this.add.text(50, 290, `${t('bossHealth')}: ${this.resultData.bossHealth}/${this.resultData.bossMaxHealth}`, { fontSize: '24px', color: '#ffffff' });
        }

        // 파워업 표시
        this.add.text(50, 320, `${t('powerUps')}:`, { fontSize: '20px', color: '#ffffff' });
        this.resultData.powerUps.forEach((powerUp, index) => {
            this.add.text(100, 350 + index * 25, `• ${localizePowerUpName(powerUp)}`, { fontSize: '16px', color: '#ffffff' });
        });

        // 리트라이 버튼 추가
        this.retryButton = this.add.text(this.cameras.main.centerX, this.cameras.main.height - 100, t('retry'), {
            fontSize: '32px',
            color: '#ffffff',
            backgroundColor: '#0000ef',
            padding: { x: 20, y: 10 },
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.retryGame());

        // 일반 공유 버튼 추가
        this.shareButton = this.add.text(this.cameras.main.centerX, this.cameras.main.height - 160, t('share'), {
            fontSize: '32px',
            color: '#0000ef',
            backgroundColor: '#ffffff',
            padding: { x: 20, y: 10 },
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.shareResult());

        // 스크린샷 다운로드 버튼 추가
        const downloadScreenshotButton = this.add.text(this.cameras.main.centerX, this.cameras.main.height - 220, t('downloadScreenshot'), {
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

        // 기록 보관소 버튼 (항상 표시) → 정적 HTML 리더보드 페이지로 이동
        this.add.text(this.cameras.main.width - 20, 20, t('records'), {
            fontSize: '24px',
            color: '#ffd700',
            backgroundColor: '#000000',
            padding: { x: 12, y: 6 },
        })
            .setOrigin(1, 0)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => { window.location.href = pageHref('records.html'); });

        // 승리한 경우에만: records.json 에 붙여넣을 기록 항목을 클립보드로 복사
        if (this.resultData.isSuccess) {
            this.add.text(this.cameras.main.width - 20, 70, t('copyRecord'), {
                fontSize: '24px',
                color: '#00ff00',
                backgroundColor: '#000000',
                padding: { x: 12, y: 6 },
            })
                .setOrigin(1, 0)
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', () => this.copyRecordEntry());
        }
    }

    /**
     * Copies the current (winning) run as a JSON entry ready to paste into the
     * "records" array of records.json.
     */
    private async copyRecordEntry() {
        const versionData = this.cache.json.get('version') as { commitHash: string } | undefined;
        const entry: RecordEntry = {
            time: Math.floor(this.resultData.time),
            level: this.resultData.level,
            powerUps: this.resultData.powerUps,
            stats: this.resultData.stats,
            commit: versionData?.commitHash || '',
            player: '',
            date: new Date().toISOString().slice(0, 10),
            note: '',
        };
        const json = JSON.stringify(entry, null, 2);
        const copied = await copyToClipboard(json);
        this.showCopySuccessMessage(
            copied ? t('recordCopied') : t('recordCopyFailed'),
            !copied
        );
    }

    private truncate(text: string, max: number): string {
        return text.length > max ? text.slice(0, max - 1) + '…' : text;
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
            url: this.getShareText(),
            files: [file],
        };

        const isShared = await share(shareData);
        if (isShared === 'shared' || isShared === 'copiedToClipboard') {
            this.showCopySuccessMessage(t('shareCopied'));
        } else {
            this.showCopySuccessMessage(t('shareFailed'), true);
        }
    }

    private getShareText(): string {
        const { level, time, experience, isSuccess, powerUps } = this.resultData;
        const resultMessage = isSuccess ? t('shareResultWin') : t('shareResultLose');
        const formattedTime = this.formatTime(time);
        const powerUpsText = powerUps.length > 0
            ? powerUps.map(p => localizePowerUpName(p)).join(', ')
            : t('noPowerUps');

        return `${resultMessage}\n${t('level')}: ${level}\n${t('time')}: ${formattedTime}\n${t('experience')}: ${experience}\n${t('powerUps')}: ${powerUpsText}\n`;
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
        const ms = Math.floor(milliseconds);
        const seconds = Math.floor(ms / 1000);
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}:${ms < 100 ? ms < 10 ? '00' : '0' : ''}${ms % 1000}`;
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