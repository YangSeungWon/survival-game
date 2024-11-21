import Phaser from 'phaser';
import PowerUpManager, { PowerUp } from '../utils/PowerUpManager';
import { PlayerAttackStat, PlayerAttackStats } from '../utils/PlayerAttackStats';
import { StatusEffectType } from '../attacks/Attack';
import { StatusEffectConfig } from '../utils/StatusEffectStats';
import { StatusEffect } from '../attacks/Attack';

/**
 * Scene to display detailed information about Power-Ups and Attacks.
 */
export default class PowerUpAndAttackStatsScene extends Phaser.Scene {
    private powerUps: PowerUp[] = [];
    private attackStats: PlayerAttackStat[] = [];
    private scrollableContainer!: Phaser.GameObjects.Container;
    private scrollableHeight: number = 0;
    private padding: number = 10;

    // Drag Scroll Variables
    private isDragging: boolean = false;
    private dragStartY: number = 0;
    private containerStartY: number = 0;

    // 깊이 상수 정의
    private static readonly DEPTH_BACKGROUND = 0;
    private static readonly DEPTH_TITLE = 1;
    private static readonly DEPTH_CONTENT = 2;
    private static readonly DEPTH_UI = 3;

    constructor() {
        super({ key: 'PowerUpAndAttackStatsScene' });
    }

    preload(): void {
        // Preload any assets if necessary
    }

    create(): void {
        this.addBackground();
        this.addTitle();
        this.initializeData();
        this.setupLayout();
        this.addBackButton();
        this.setupScrolling();
    }

    /**
     * Adds the background rectangle to the scene.
     */
    private addBackground(): void {
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x2e2e2e)
            .setOrigin(0)
            .setDepth(PowerUpAndAttackStatsScene.DEPTH_BACKGROUND);
    }

    /**
     * Adds the title text to the scene.
     */
    private addTitle(): void {
        this.add.text(this.cameras.main.centerX, 50, 'Power-Ups and Attacks', {
            fontSize: '36px',
            color: '#ffffff',
            fontFamily: '"Noto Sans", sans-serif'
        }).setOrigin(0.5).setDepth(PowerUpAndAttackStatsScene.DEPTH_TITLE);
    }

    /**
     * Initializes the data for Power-Ups and Attacks.
     */
    private initializeData(): void {
        this.powerUps = PowerUpManager.getPowerUps();
        this.attackStats = PlayerAttackStats;
    }

    /**
     * Sets up the layout including scrollable container and sections.
     */
    private setupLayout(): void {
        const layoutThreshold = 800;
        const isDoubleColumn = this.cameras.main.width >= layoutThreshold;

        this.scrollableContainer = this.add.container(this.padding, 100)
            .setDepth(PowerUpAndAttackStatsScene.DEPTH_CONTENT);

        const backgroundWidth = isDoubleColumn
            ? this.cameras.main.width - 3 * this.padding
            : this.cameras.main.width - 2 * this.padding;
        const backgroundHeight = isDoubleColumn
            ? Math.max(this.powerUps.length * 120 + 100, this.attackStats.length * 120 + 100)
            : (this.powerUps.length + this.attackStats.length) * 120 + 100;

        const background = this.add.rectangle(0, 0, backgroundWidth, backgroundHeight, 0x424242)
            .setOrigin(0)
            .setDepth(PowerUpAndAttackStatsScene.DEPTH_CONTENT);
        this.scrollableContainer.add(background);

        // Sections: Power-Ups and Attacks
        this.setupSections(isDoubleColumn);

        // Mask for Scrolling
        const maskShape = this.make.graphics();
        maskShape.fillStyle(0xffffff);
        maskShape.fillRect(this.padding, 100, backgroundWidth, backgroundHeight);
        const mask = maskShape.createGeometryMask();
        this.scrollableContainer.setMask(mask);
    }

    /**
     * Sets up the Power-Ups and Attacks sections.
     * @param isDoubleColumn Whether to layout in double columns.
     */
    private setupSections(isDoubleColumn: boolean): void {
        if (isDoubleColumn) {
            const sectionWidth = (this.cameras.main.width - 3 * this.padding) / 2;

            // Left Column - Power-Ups
            const powerUpContainer = this.add.container(0, 0);
            powerUpContainer.setSize(sectionWidth, this.powerUps.length * 120 + 100);
            this.renderPowerUps(powerUpContainer, 0);
            this.scrollableContainer.add(powerUpContainer);

            // Right Column - Attacks
            const attackContainer = this.add.container(sectionWidth + this.padding, 0);
            attackContainer.setSize(sectionWidth, this.attackStats.length * 120 + 100);
            this.renderAttacks(attackContainer, 0);
            this.scrollableContainer.add(attackContainer);

            this.scrollableHeight = Math.max(
                powerUpContainer.height,
                attackContainer.height
            );
        } else {
            // Single Column - Power-Ups followed by Attacks
            let yOffset = 0;
            yOffset = this.renderPowerUps(this.scrollableContainer, yOffset);
            yOffset = this.renderAttacks(this.scrollableContainer, yOffset + 50);
            this.scrollableHeight = yOffset;
        }
    }

    /**
     * Renders the list of Power-Ups in the given container.
     * @param container The container to add Power-Up texts to.
     * @param startY The starting Y position.
     * @returns The updated Y position after adding Power-Ups.
     */
    private renderPowerUps(container: Phaser.GameObjects.Container, startY: number): number {
        const sectionTitle = this.add.text(0, startY, 'Power-Ups', {
            fontSize: '28px',
            color: '#FFD700',
            fontFamily: '"Noto Sans", sans-serif',
            fontStyle: 'bold',
            wordWrap: { width: container.width }
        }).setDepth(PowerUpAndAttackStatsScene.DEPTH_CONTENT);
        container.add(sectionTitle);
        let currentY = startY + sectionTitle.height + 20;

        const powerUpTextStyle: Phaser.Types.GameObjects.Text.TextStyle = { 
            fontSize: '18px', 
            color: '#FFFFFF', 
            fontFamily: '"Noto Sans", sans-serif',
            wordWrap: { width: container.width },
        };

        this.powerUps.forEach((powerUp) => {
            // Power-Up Name
            const nameText = this.add.text(0, currentY, powerUp.name, {
                fontSize: '22px',
                color: `#${powerUp.color.toString(16).padStart(6, '0')}`,
                fontFamily: '"Noto Sans", sans-serif',
                fontStyle: 'bold',
                wordWrap: { width: container.width }
            }).setDepth(PowerUpAndAttackStatsScene.DEPTH_CONTENT);
            container.add(nameText);
            currentY += nameText.height + 5;

            // Power-Up Description
            const descriptionText = this.add.text(0, currentY, powerUp.description, powerUpTextStyle)
                .setDepth(PowerUpAndAttackStatsScene.DEPTH_CONTENT);
            container.add(descriptionText);
            currentY += descriptionText.height + 20;
        });

        return currentY;
    }

    /**
     * Renders the list of Attacks in the given container.
     * @param container The container to add Attack texts to.
     * @param startY The starting Y position.
     * @returns The updated Y position after adding Attacks.
     */
    private renderAttacks(container: Phaser.GameObjects.Container, startY: number): number {
        const sectionTitle = this.add.text(0, startY, 'Attacks', {
            fontSize: '28px',
            color: '#FF4500',
            fontFamily: '"Noto Sans", sans-serif',
            fontStyle: 'bold',
            wordWrap: { width: container.width }
        }).setDepth(PowerUpAndAttackStatsScene.DEPTH_CONTENT);
        container.add(sectionTitle);
        let currentY = startY + sectionTitle.height + 20;

        const attackTextStyle: Phaser.Types.GameObjects.Text.TextStyle = { 
            fontSize: '18px', 
            color: '#FFFFFF', 
            fontFamily: '"Noto Sans", sans-serif',
            wordWrap: { width: container.width },
        };

        this.attackStats.forEach((attack) => {
            // Attack Name
            const nameText = this.add.text(0, currentY, attack.name, {
                fontSize: '22px',
                color: `#${attack.color.toString(16).padStart(6, '0')}`,
                fontFamily: '"Noto Sans", sans-serif',
                fontStyle: 'bold',
                wordWrap: { width: container.width }
            }).setDepth(PowerUpAndAttackStatsScene.DEPTH_CONTENT);
            container.add(nameText);
            currentY += nameText.height + 5;

            // Attack Details
            const detailsText = this.add.text(0, currentY, this.formatAttackDetails(attack), attackTextStyle)
                .setDepth(PowerUpAndAttackStatsScene.DEPTH_CONTENT);
            container.add(detailsText);
            currentY += detailsText.height + 20;
        });

        return currentY;
    }

    /**
     * Formats the attack details into a readable string.
     * @param attack The attack statistics.
     * @returns Formatted attack details.
     */
    private formatAttackDetails(attack: PlayerAttackStat): string {
        let details = `Attack Speed: ${attack.attackSpeed}\nAttack Power: ${attack.attackPower}\nAttack Range: ${attack.attackRange}`;
        if (attack.attackAngle) details += `\nAttack Angle: ${attack.attackAngle}`;
        if (attack.statusEffect) details += `\nStatus Effect: ${this.formatStatusEffect(attack.statusEffect)}`;
        if (attack.projectileSpeed) details += `\nProjectile Speed: ${attack.projectileSpeed}`;
        if (attack.projectileSize) details += `\nProjectile Size: ${attack.projectileSize}`;
        if (attack.piercingCount !== undefined) details += `\nPiercing Count: ${attack.piercingCount}`;
        if (attack.effectRange) details += `\nEffect Range: ${attack.effectRange}`;
        if (attack.effectDuration) details += `\nEffect Duration: ${attack.effectDuration}`;
        if (attack.effectTickRate) details += `\nEffect Tick Rate: ${attack.effectTickRate}`;
        if (attack.beamDuration) details += `\nBeam Duration: ${attack.beamDuration}`;
        if (attack.beamWidth) details += `\nBeam Width: ${attack.beamWidth}`;
        return details;
    }

    /**
     * Formats the status effect into a readable string.
     * @param effect The status effect.
     * @returns Formatted status effect description.
     */
    private formatStatusEffect(effect?: StatusEffectType): string {
        if (!effect) return 'None';
        switch (effect) {
            case StatusEffectType.BURN:
                return `Burn: Deals ${StatusEffectConfig.burn.damagePercent}% of max health as damage over time.`;
            case StatusEffectType.POISON:
                return `Poison: Deals ${StatusEffectConfig.poison.damagePercent}% of current health as damage over time.`;
            case StatusEffectType.FREEZE:
                return `Freeze: Reduces movement speed by ${StatusEffectConfig.freeze.multiplierPercent}%.`;
            case StatusEffectType.STUN:
                return `Stun: Disables movement and attacking.`;
            default:
                return 'Unknown Effect';
        }
    }

    /**
     * Sets up the scrolling functionality for the scene.
     */
    private setupScrolling(): void {
        // Enable scrolling with mouse wheel
        this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _gameObjects: Phaser.GameObjects.GameObject[], deltaX: number, deltaY: number, _deltaZ: number) => {
            this.scroll(deltaY * 0.5);
        });

        // Touch scrolling support
        this.scrollableContainer.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            this.isDragging = true;
            this.dragStartY = pointer.y;
            this.containerStartY = this.scrollableContainer.y;
        });

        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (this.isDragging) {
                const deltaY = pointer.y - this.dragStartY;
                this.scrollableContainer.y = this.containerStartY + deltaY;
                this.clampScroll();
            }
        });

        this.input.on('pointerup', () => {
            this.isDragging = false;
        });
    }

    /**
     * Scrolls the container by the given delta.
     * @param deltaY The amount to scroll vertically.
     */
    private scroll(deltaY: number): void {
        this.scrollableContainer.y -= deltaY;
        this.clampScroll();
    }

    /**
     * Clamps the scroll position to prevent overscrolling.
     */
    private clampScroll(): void {
        const maxScroll = 120;
        const minScroll = -(this.scrollableHeight - (this.cameras.main.height - 150));
        this.scrollableContainer.y = Phaser.Math.Clamp(this.scrollableContainer.y, minScroll, maxScroll);
    }

    /**
     * Adds a back button to navigate to the previous scene.
     */
    private addBackButton(): void {
        const backButton = this.add.text(this.padding, this.cameras.main.height - 100, 'Back', {
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        })
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.start('PreloadScene'); // Navigate to the main menu scene
            })
            .setDepth(PowerUpAndAttackStatsScene.DEPTH_UI);

        // Keyboard Shortcut for Back (Escape Key)
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
        // Optional Snap Animation
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
