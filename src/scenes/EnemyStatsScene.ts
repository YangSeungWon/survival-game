import Phaser from 'phaser';
import EnemyStats, { EnemyStat } from '../utils/EnemyStats';

export default class EnemyStatsScene extends Phaser.Scene {
    private scrollableContainer!: Phaser.GameObjects.Container;
    private scrollableHeight: number = 0;
    private padding: number = 50;

    // Drag Scroll Variables
    private isDragging: boolean = false;
    private dragStartY: number = 0;
    private containerStartY: number = 0;

    constructor() {
        super({ key: 'EnemyStatsScene' });
    }

    preload(): void {
        // Preload any assets if necessary
    }

    create(): void {
        this.addBackground();
        this.addTitle();
        this.setupScrollableContainer();
        this.addBackButton();
        this.setupScrolling();
    }

    private addBackground(): void {
        // 전체 배경 추가 (가장 뒤에 위치하도록)
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x1e1e1e)
            .setOrigin(0)
            .setDepth(0);
    }

    private addTitle(): void {
        this.add.text(this.cameras.main.centerX, 50, 'Enemy Stats', {
            fontSize: '40px',
            color: '#ffffff',
            fontFamily: '"Noto Sans", sans-serif'
        })
            .setOrigin(0.5)
            .setDepth(1); // 배경 위에 위치
    }

    private setupScrollableContainer(): void {
        const scrollableWidth = this.cameras.main.width - 2 * this.padding;
        const scrollableHeight = this.cameras.main.height - 100;

        // 스크롤 가능한 내용 컨테이너 설정
        this.scrollableContainer = this.add.container(this.padding, 120)
            .setDepth(3);
        const content = this.add.container(0, 0);
        this.scrollableContainer.add(content);

        let yOffset = 0;

        EnemyStats.forEach(enemy => {
            const enemyHeader = this.add.text(0, yOffset, `${enemy.type}`, {
                fontSize: '24px',
                color: `#${enemy.color.toString(16).padStart(6, '0')}`,
                fontFamily: '"Noto Sans", sans-serif',
                fontStyle: 'bold'
            }).setDepth(4);
            content.add(enemyHeader);
            yOffset += enemyHeader.height + 10;

            const statsText = this.getEnemyStatsText(enemy);
            const enemyStats = this.add.text(0, yOffset, statsText, { fontSize: '20px', color: '#ffffff', fontFamily: '"Noto Sans", sans-serif' })
                .setDepth(4);
            content.add(enemyStats);
            yOffset += enemyStats.height + 20;
        });

        this.scrollableHeight = yOffset;
        console.log(`Scrollable Height: ${this.scrollableHeight}`);

        // 마스크 설정
        const maskShape = this.make.graphics();
        maskShape.fillStyle(0xffffff);
        maskShape.fillRect(0, 0, scrollableWidth, scrollableHeight);
        const mask = maskShape.createGeometryMask();
        content.setMask(mask);

        // 터치 스크롤 지원
        this.scrollableContainer.setInteractive(new Phaser.Geom.Rectangle(0, 0, scrollableWidth, scrollableHeight), Phaser.Geom.Rectangle.Contains);
    }

    private getEnemyStatsText(enemy: EnemyStat): string {
        let statsText = `Size: ${enemy.size}\nSpeed: ${enemy.speed}\nHealth: ${enemy.health}\nAttack Speed: ${enemy.attackSpeed}\nAttack Power: ${enemy.attackPower}\nAttack Range: ${enemy.attackRange}`;
        if (enemy.attackAngle) statsText += `\nAttack Angle: ${enemy.attackAngle}`;
        if (enemy.effectRange) statsText += `\nEffect Range: ${enemy.effectRange}`;
        if (enemy.effectDuration) statsText += `\nEffect Duration: ${enemy.effectDuration}`;
        if (enemy.effectTickRate) statsText += `\nEffect Tick Rate: ${enemy.effectTickRate}`;
        if (enemy.beamDuration && enemy.beamWidth) statsText += `\nBeam Duration: ${enemy.beamDuration}\nBeam Width: ${enemy.beamWidth}`;
        statsText += `\nExperience Points: ${enemy.experiencePoint}\nLevel Range: ${enemy.fromLevel} - ${enemy.toLevel}`;
        return statsText;
    }

    private setupScrolling(): void {
        // 마우스 휠 스크롤 활성화
        this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _gameObjects: Phaser.GameObjects.GameObject[], deltaX: number, deltaY: number, _deltaZ: number) => {
            console.log(`Wheel deltaY: ${deltaY}`); // 디버깅 로그
            this.scroll(deltaY * 0.5);
        });

        // 터치 스크롤 지원
        this.scrollableContainer.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.cameras.main.width - 2 * this.padding, this.cameras.main.height - 200), Phaser.Geom.Rectangle.Contains);
        this.scrollableContainer.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            console.log('Pointer Down'); // 디버깅 로그
            this.isDragging = true;
            this.dragStartY = pointer.y;
            this.containerStartY = this.scrollableContainer.y;
        });

        this.input.on('pointerup', () => {
            console.log('Pointer Up'); // 디버깅 로그
            this.isDragging = false;
            // 가까우면 스냅
            if (Math.abs(this.scrollableContainer.y) < 5) {
                this.scrollableContainer.y = 0;
            }
        });
    }

    private scroll(deltaY: number): void {
        this.scrollableContainer.y -= deltaY;
        console.log(`Scrolling to y: ${this.scrollableContainer.y}`); // 디버깅 로그
        this.clampScroll();
    }

    private clampScroll(): void {
        const maxScroll = 120;
        const minScroll = -(this.scrollableHeight - (this.cameras.main.height - 100));
        console.log(`Clamping y: ${this.scrollableContainer.y} between ${minScroll} and ${maxScroll}`); // 디버깅 로그
        if (this.scrollableContainer.y > maxScroll) {
            this.scrollableContainer.y = maxScroll;
        } else if (this.scrollableContainer.y < minScroll) {
            this.scrollableContainer.y = minScroll;
        }
    }

    private addBackButton(): void {
        const backButton = this.add.text(this.padding, this.cameras.main.height - 50, 'Back', {
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        })
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.start('PreloadScene'); // 메인 메뉴 씬으로 변경
            })
            .setDepth(4); // 콘텐츠 위에 배치

        // 키보드 단축키 (Escape 키)
        const backListener = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                this.scene.start('PreloadScene');
            }
        };
        if (this.input.keyboard) {
            this.input.keyboard.on('keydown', backListener);
        }
    }

    update(time: number, delta: number): void {
        /*
        // 스냅 애니메이션 추가 (선택 사항)
        if (Math.abs(this.scrollableContainer.y) < 5 && this.scrollableContainer.y !== 0) {
            this.tweens.add({
                targets: this.scrollableContainer,
                y: 0,
                duration: 200,
                ease: 'Power2'
            });
        }
        */
    }
}
