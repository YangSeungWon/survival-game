import Phaser from 'phaser';
import GameScene from './GameScene';
import share from '../utils/share';
import copyToClipboard from '../utils/copyToClipboard';
import { RecordEntry, RecordStats, RecordsFile, RecordCategory, formatRecordTime, formatCondition, sortByCategory, groupByBalance, shortCommit } from '../utils/records';

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
    private recordsPanel: Phaser.GameObjects.GameObject[] = [];
    private recordsCategory: RecordCategory = 'fastest';

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
        // Static record archive (curated in records.json). Missing/failed load is
        // fine — the archive just shows as empty.
        this.load.json('records', 'records.json');
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
        const versionData = this.cache.json.get('version') as { commitHash: string };
        const commitHash = versionData?.commitHash || 'Unknown';
        this.add.text(50, 170, `Commit: ${commitHash}`, { fontSize: '16px', color: '#ffffff' });
        this.add.text(50, 200, `Level: ${this.resultData.level}`, { fontSize: '24px', color: '#ffffff' });
        this.add.text(50, 230, `Time: ${this.formatTime(this.resultData.time)}`, { fontSize: '24px', color: '#ffffff' });
        this.add.text(50, 260, `Experience: ${this.resultData.experience}`, { fontSize: '24px', color: '#ffffff' });
        if (this.resultData.bossHealth) {
            this.add.text(50, 290, `Boss Health: ${this.resultData.bossHealth}/${this.resultData.bossMaxHealth}`, { fontSize: '24px', color: '#ffffff' });
        }

        // 파워업 표시
        this.add.text(50, 320, 'Power-Ups:', { fontSize: '20px', color: '#ffffff' });
        this.resultData.powerUps.forEach((powerUp, index) => {
            this.add.text(100, 350 + index * 25, `• ${powerUp}`, { fontSize: '16px', color: '#ffffff' });
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

        // 기록 보관소 버튼 (항상 표시)
        this.add.text(this.cameras.main.width - 20, 20, '🏆 Records', {
            fontSize: '24px',
            color: '#ffd700',
            backgroundColor: '#000000',
            padding: { x: 12, y: 6 },
        })
            .setOrigin(1, 0)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.openRecords());

        // 승리한 경우에만: records.json 에 붙여넣을 기록 항목을 클립보드로 복사
        if (this.resultData.isSuccess) {
            this.add.text(this.cameras.main.width - 20, 70, '📋 Copy Record', {
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
     * Opens the record archive overlay. Records are grouped by commit (balance
     * version) since times are only comparable within the same commit, and each
     * group is ranked by the active category (fastest clear / longest survival).
     * Each row shows the rank, time, player, and condition.
     */
    private openRecords() {
        this.closeRecords();
        const cam = this.cameras.main;
        const depth = 1000;

        const overlay = this.add.rectangle(cam.centerX, cam.centerY, cam.width, cam.height, 0x000000, 0.9)
            .setDepth(depth)
            .setInteractive();
        this.recordsPanel.push(overlay);

        const isFastest = this.recordsCategory === 'fastest';
        const title = this.add.text(cam.centerX, 24, '🏆 기록 보관소 · Leaderboard', {
            fontSize: '26px',
            color: '#ffd700',
        }).setOrigin(0.5, 0).setDepth(depth + 1);
        this.recordsPanel.push(title);

        // Category toggle: fastest clear vs longest survival
        this.addCategoryButton('⏱ 최단 클리어', 'fastest', cam.centerX - 130, 64, depth);
        this.addCategoryButton('🐢 최장 생존', 'longest', cam.centerX + 20, 64, depth);

        const data = this.cache.json.get('records') as RecordsFile | undefined;
        const allRecords = data?.records ?? [];

        if (allRecords.length === 0) {
            const empty = this.add.text(
                cam.centerX,
                cam.centerY,
                '아직 기록이 없습니다.\n승리 후 [📋 Copy Record]로 JSON을 복사해\nrecords.json 의 "records" 배열에 추가하고 커밋하세요.',
                { fontSize: '18px', color: '#ffffff', align: 'center' }
            ).setOrigin(0.5).setDepth(depth + 1);
            this.recordsPanel.push(empty);
        } else {
            const groups = groupByBalance(allRecords);
            const lineHeight = 24;
            const maxRowsPerGroup = 10;
            let y = 108;

            groups.forEach(group => {
                const header = this.add.text(24, y, `▓ Balance ${group.version} · ${group.records.length} clears`, {
                    fontSize: '17px',
                    color: '#66ccff',
                    fontStyle: 'bold',
                }).setDepth(depth + 1);
                this.recordsPanel.push(header);
                y += lineHeight + 4;

                const ranked = sortByCategory(group.records, this.recordsCategory);
                ranked.slice(0, maxRowsPerGroup).forEach((record, index) => {
                    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;
                    const player = record.player ? `[${record.player}]` : '[?]';
                    const condition = this.truncate(formatCondition(record), 52);
                    const camera = record.screenshot ? ' 📷' : '';
                    const line = `${medal}  ⏱ ${formatRecordTime(record.time)}  ${player}  L${record.level}  @${shortCommit(record.commit)}  ${condition}${camera}`;
                    const row = this.add.text(40, y, line, {
                        fontSize: '15px',
                        color: index === 0 ? '#ffd700' : '#ffffff',
                    }).setDepth(depth + 1);
                    if (record.screenshot) {
                        const shot = record.screenshot;
                        row.setInteractive({ useHandCursor: true })
                            .on('pointerdown', () => this.showRecordScreenshot(shot));
                    }
                    this.recordsPanel.push(row);
                    y += lineHeight;
                });

                if (group.records.length > maxRowsPerGroup) {
                    const more = this.add.text(40, y, `… +${group.records.length - maxRowsPerGroup} more`, {
                        fontSize: '13px',
                        color: '#aaaaaa',
                    }).setDepth(depth + 1);
                    this.recordsPanel.push(more);
                    y += lineHeight;
                }
                y += 10; // gap between groups
            });
        }

        const closeButton = this.add.text(cam.centerX, cam.height - 50, 'Close', {
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#0000ef',
            padding: { x: 20, y: 10 },
        })
            .setOrigin(0.5)
            .setDepth(depth + 1)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.closeRecords());
        this.recordsPanel.push(closeButton);
    }

    /** Adds a category toggle button; the active category is highlighted. */
    private addCategoryButton(label: string, category: RecordCategory, x: number, y: number, depth: number) {
        const active = this.recordsCategory === category;
        const button = this.add.text(x, y, label, {
            fontSize: '16px',
            color: active ? '#000000' : '#ffffff',
            backgroundColor: active ? '#ffd700' : '#333333',
            padding: { x: 10, y: 5 },
        })
            .setDepth(depth + 1)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                if (this.recordsCategory !== category) {
                    this.recordsCategory = category;
                    this.openRecords();
                }
            });
        this.recordsPanel.push(button);
    }

    private closeRecords() {
        this.recordsPanel.forEach(obj => obj.destroy());
        this.recordsPanel = [];
    }

    /** Loads (on demand) and shows a record's screenshot full-screen. */
    private showRecordScreenshot(path: string) {
        const key = 'recordShot:' + path;
        if (this.textures.exists(key)) {
            this.displayScreenshotOverlay(key);
            return;
        }
        this.load.image(key, path);
        this.load.once('complete', () => this.displayScreenshotOverlay(key));
        this.load.once('loaderror', () => this.showCopySuccessMessage('스크린샷을 불러오지 못했습니다.', true));
        this.load.start();
    }

    private displayScreenshotOverlay(textureKey: string) {
        const cam = this.cameras.main;
        const depth = 2000;

        const backdrop = this.add.rectangle(cam.centerX, cam.centerY, cam.width, cam.height, 0x000000, 0.95)
            .setDepth(depth)
            .setInteractive();
        this.recordsPanel.push(backdrop);

        const image = this.add.image(cam.centerX, cam.centerY, textureKey).setDepth(depth + 1);
        // Fit within the screen while preserving aspect ratio (leave a margin).
        const scale = Math.min((cam.width * 0.92) / image.width, (cam.height * 0.86) / image.height, 1);
        image.setScale(scale);
        this.recordsPanel.push(image);

        const hint = this.add.text(cam.centerX, cam.height - 28, '아무 곳이나 클릭하면 닫힙니다', {
            fontSize: '15px',
            color: '#cccccc',
        }).setOrigin(0.5).setDepth(depth + 1);
        this.recordsPanel.push(hint);

        // Click the backdrop (or image) to dismiss just this overlay and return
        // to the leaderboard underneath.
        const dismiss = () => {
            backdrop.destroy();
            image.destroy();
            hint.destroy();
            this.recordsPanel = this.recordsPanel.filter(o => o !== backdrop && o !== image && o !== hint);
        };
        backdrop.on('pointerdown', dismiss);
        image.setInteractive({ useHandCursor: true }).on('pointerdown', dismiss);
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
            copied ? 'Record JSON copied — paste into records.json' : 'Failed to copy record.',
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