import Phaser from 'phaser';
import FastEnemy from '../sprites/enemies/FastEnemy';
import StrongEnemy from '../sprites/enemies/StrongEnemy';
import GunEnemy from '../sprites/enemies/GunEnemy';
import ProjectilePool from '../utils/ProjectilePool';
import ExperiencePointPool from '../utils/ExperiencePointPool';
import Player from '../sprites/Player';
import Heart from '../sprites/Heart';
import PowerUpManager from '../utils/PowerUpManager';
import ExperiencePoint from '../sprites/ExperiencePoint';

export default class GameScene extends Phaser.Scene {
    score: number;
    elapsedTimeMillis: number;
    mapSize: number;
    enemySpawnInterval: number;
    heartSpawnInterval: number;
    lastUpdateTime: number;
    player: Player | null;
    projectilePool: ProjectilePool | null;
    experiencePointPool: ExperiencePointPool | null;
    enemies: Phaser.Physics.Arcade.Group | null;
    experiencePoints: Phaser.Physics.Arcade.Group | null;
    hearts: Phaser.Physics.Arcade.Group | null;
    enemySpawnEvent: Phaser.Time.TimerEvent | null;
    heartSpawnEvent: Phaser.Time.TimerEvent | null;
    attackEvents: Phaser.Time.TimerEvent[];
    cursors: Phaser.Types.Input.Keyboard.CursorKeys | null;
    scoreText: Phaser.GameObjects.Text | null;
    healthText: Phaser.GameObjects.Text | null;
    playerStatsText: Phaser.GameObjects.Text | null;
    timeText: Phaser.GameObjects.Text | null;
    experienceText: Phaser.GameObjects.Text | null;
    fpsText: Phaser.GameObjects.Text | null;
    isPaused: boolean;
    isPausedInGame: boolean;
    joystick?: any; // rexvirtualjoystick 타입 정의 필요
    joystickCursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    powerUpManager: PowerUpManager | null;
    healthBarBackground: Phaser.GameObjects.Graphics | null;
    healthBar: Phaser.GameObjects.Graphics | null;
    experienceBarBackground: Phaser.GameObjects.Graphics | null;
    experienceBar: Phaser.GameObjects.Graphics | null;

    private defaultTextStyle: Phaser.Types.GameObjects.Text.TextStyle = {
        fontFamily: '"Noto Sans", sans-serif',
        fontSize: '32px',
        color: '#fff'
    };

    constructor() {
        super({ key: 'GameScene' });
        this.score = 0;
        this.elapsedTimeMillis = 0;
        this.mapSize = 1000;
        this.enemySpawnInterval = 500; // 0.5초 간격
        this.heartSpawnInterval = 10000; // 10초 간격
        this.lastUpdateTime = 0;
        this.isPaused = false;
        this.isPausedInGame = false;
        this.attackEvents = [];

        this.player = null;
        this.projectilePool = null;
        this.experiencePointPool = null;
        this.enemies = null;
        this.experiencePoints = null;
        this.hearts = null;
        this.enemySpawnEvent = null;
        this.heartSpawnEvent = null;
        this.cursors = null;
        this.scoreText = null;
        this.healthText = null;
        this.playerStatsText = null;
        this.timeText = null;
        this.experienceText = null;
        this.fpsText = null;
        this.powerUpManager = null;
        this.healthBarBackground = null;
        this.healthBar = null;
        this.experienceBarBackground = null;
        this.experienceBar = null;
    }

    preload(): void {
        this.load.script('rexvirtualjoystick', 'https://cdn.jsdelivr.net/npm/phaser3-rex-plugins/dist/rexvirtualjoystickplugin.min.js');
        this.load.once('complete', () => {
            this.plugins.install('rexvirtualjoystick', (window as any).rexvirtualjoystickplugin, true);
            console.log('Plugin after install:', this.plugins.get('rexvirtualjoystick'));
        });
    }

    create(): void {
        this.player = new Player(this);
        this.projectilePool = new ProjectilePool(this);
        this.experiencePointPool = new ExperiencePointPool(this);
        this.enemies = this.physics.add.group();
        this.experiencePoints = this.physics.add.group();
        this.hearts = this.physics.add.group();
        this.enemySpawnEvent = this.time.addEvent({
            delay: this.enemySpawnInterval, 
            callback: this.createEnemies,
            callbackScope: this,
            loop: true
        });
        this.heartSpawnEvent = this.time.addEvent({
            delay: this.heartSpawnInterval, // 10 seconds
            callback: this.spawnHeart,
            callbackScope: this,
            loop: true
        });

        this.cursors = this.input.keyboard!.createCursorKeys() ? this.input.keyboard!.createCursorKeys() : null;

        this.scoreText = this.add.text(16, 16, 'Score: 0', this.defaultTextStyle).setScrollFactor(0).setDepth(1);
        this.healthText = this.add.text(16, 50, `Health: ${this.player.health}/${this.player.maxHealth}`, { ...this.defaultTextStyle, color: '#f00' }).setScrollFactor(0).setDepth(1);
        this.playerStatsText = this.add.text(16, this.cameras.main.height - 200, '', { ...this.defaultTextStyle, fontSize: '16px' }).setScrollFactor(0).setDepth(1);
        this.timeText = this.add.text(16, 84, 'Time: 0:00', this.defaultTextStyle).setScrollFactor(0).setDepth(1);
        this.experienceText = this.add.text(16, 118, 'XP: 0', { ...this.defaultTextStyle, color: '#00ff00' }).setScrollFactor(0).setDepth(1);
        this.fpsText = this.add.text(this.cameras.main.width / 2, 8, 'FPS: 0', { ...this.defaultTextStyle, fontSize: '16px' }).setScrollFactor(0).setDepth(1);

        this.powerUpManager = new PowerUpManager(this, this.player);

        this.healthBarBackground = this.add.graphics();
        this.healthBarBackground.fillStyle(0x555555, 1); // Grey color for background
        this.healthBarBackground.fillRect(this.cameras.main.width - 216, 16, 200, 20).setScrollFactor(0).setDepth(1); // Full size of the health bar

        this.healthBar = this.add.graphics();
        this.healthBar.setDepth(2); // Set depth for health bar
        this.updateHealthRelatedUI();

        this.experienceBarBackground = this.add.graphics();
        this.experienceBarBackground.fillStyle(0x555555, 1); // Grey color for background
        this.experienceBarBackground.fillRect(this.cameras.main.width - 216, 40, 200, 20).setScrollFactor(0).setDepth(1); // Full size of the experience bar

        this.experienceBar = this.add.graphics();
        this.experienceBar.setDepth(2); // Set depth for experience bar
        this.updateExperienceRelatedUI();

        this.physics.world.setBounds(0, 0, this.mapSize, this.mapSize);
        this.add.rectangle(this.mapSize / 2, this.mapSize / 2, this.mapSize * 2, this.mapSize * 2, 0x222222);
        this.add.rectangle(this.mapSize / 2, this.mapSize / 2, this.mapSize, this.mapSize, 0x000000);

        const borderGraphics = this.add.graphics();
        borderGraphics.lineStyle(4, 0xffffff, 1); // White border with 4px thickness
        borderGraphics.strokeRect(0, 0, this.mapSize, this.mapSize);

        // Create player
        this.add.existing(this.player);
        this.physics.add.existing(this.player);
        this.player.setCollideWorldBounds(true);

        // Set camera to follow the player
        this.cameras.main.startFollow(this.player);

        // Call createEnemies to spawn enemies initially
        this.createEnemies();

        // Overlap settings instead of collider
        this.physics.add.overlap(this.player, this.experiencePointPool.getPoints(), (player, experience) => {
            this.collectExperience(player as Player, experience as ExperiencePoint);
        }, null as any, this);
        this.physics.add.overlap(this.player, this.hearts, (player, heart) => {
            this.collectHeart(player as Player, heart as Heart);
        }, null as any, this);

        // Listen to health changes
        this.events.on('playerHealthChanged', this.updateHealthRelatedUI, this);

        // Listen to experience changes
        this.events.on('experienceUpdated', this.updateExperienceRelatedUI, this);

        // Listen to game over
        this.events.on('playerDead', this.gameOver, this);

        // Listen to level up event
        this.events.on('playerLevelUp', this.onPlayerLevelUp, this);

        // Check if the device is a mobile device
        const isMobile = /Mobi|Android/i.test(navigator.userAgent);
        if (isMobile && this.plugins.get('rexvirtualjoystick')) {
            // Add Virtual Joystick for mobile devices
            this.joystick = (this.plugins.get('rexvirtualjoystick') as any).add(this, {
                x: this.cameras.main.width - 100,
                y: this.cameras.main.height - 100,
                radius: 50,
                base: this.add.circle(0, 0, 50, 0x888888).setAlpha(0.5),
                thumb: this.add.circle(0, 0, 25, 0xcccccc).setAlpha(0.8),
                dir: '8dir', // Allow 8-directional movement
                fixed: true // Fix joystick to camera
            });

            // Create cursor keys from joystick
            this.joystickCursors = this.joystick.createCursorKeys();
        }

        // Add event listener for visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                console.log('Window is not visible, pausing game.');
                this.pauseGame();
            } else {
                console.log('Window is visible, resuming game.');
                if (!this.isPausedInGame) {
                    this.resumeGame();
                }
            }
        });
    }

    createEnemies() {
        if (this.isPaused || document.hidden) return; // Check if the game is paused or if the window is not visible

        const enemyType = Phaser.Math.RND.pick(['FastEnemy', 'FastEnemy', 'StrongEnemy', 'GunEnemy', 'GunEnemy']);
        var enemy;
        if (enemyType === 'FastEnemy') {
            enemy = new FastEnemy(this);
        } else if (enemyType === 'StrongEnemy') {
            enemy = new StrongEnemy(this);
        } else if (enemyType === 'GunEnemy') {
            enemy = new GunEnemy(this);
        } else {
            console.error("Unknown enemy type: " + enemyType);
            return;
        }
        this.enemies!.add(enemy);
    }

    /**
     * Handles the collection of experience points by the player.
     * @param {Player} player - The player object.
     * @param {ExperiencePoint} experience - The experience point object.
     */
    collectExperience(player: Player, experience: ExperiencePoint) {
        experience.collect();
    }

    update(time: number, deltaGame: number): void {
        if (this.isPaused) return; // Check if the game is paused

        // Calculate the time difference since the last update
        const deltaTime = this.lastUpdateTime ? time - this.lastUpdateTime : 0;
        this.lastUpdateTime = time; // Update the last update time

        // Update elapsed time
        this.elapsedTimeMillis += deltaTime;

        const deltaMultiplier = deltaTime / deltaGame;

        this.tweens.timeScale = deltaMultiplier;
        this.time.timeScale = deltaMultiplier;


        // Update player movement based on joystick if smartphone, else use keyboard
        if (this.joystick && this.joystickCursors) {
            // Use joystick input
            this.player!.move(this.joystickCursors, deltaTime, this.joystick);
        } else if (this.cursors) {
            // Use keyboard input
            this.player!.move(this.cursors, deltaTime);
        } else {
            console.error("No cursor keys found");
        }

        // Update each projectile
        this.projectilePool!.moveAll(deltaTime);

        // Update each enemy
        this.enemies!.getChildren().forEach(enemy => {
            enemy.update(this.player, deltaTime);
        });

        // Update player stats text
        var statsText = '';
        statsText += `Level: ${this.player!.level}\n`;
        statsText += `XP: ${this.player!.experience}\n`;
        statsText += `XP Threshold: ${this.player!.experienceThreshold}\n`;
        statsText += `Enemy Spawn Interval: ${this.enemySpawnInterval}\n`;
        statsText += `Speed: ${this.player!.speed}\n`;
        statsText += `Life Steal (%): ${this.player!.percentLifeSteal}\n`;
        statsText += `Defense: ${this.player!.defense}\n`;
        statsText += `Critical Hit Chance (%): ${this.player!.percentCritChance}\n`;
        statsText += `Attacks: ${this.player!.attacks.length}`;
        for (const attack of this.player!.attacks) {
            statsText += `\n\t- P${attack.attackPower} S${attack.attackSpeed} R${attack.attackRange}`;
        }
        this.playerStatsText!.setText(statsText);


        const fps = Math.floor(this.game.loop.actualFps);
        this.fpsText!.setText(`FPS: ${fps}\nDelta: ${deltaMultiplier}`);

        // Calculate minutes and seconds
        const minutes = Math.floor(this.elapsedTimeMillis / 60000);
        const seconds = Math.floor((this.elapsedTimeMillis % 60000) / 1000);

        // Update time text
        this.timeText!.setText(`Time: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
    }

    updateHealthRelatedUI() {
        this.updateHealthText();
        this.updateHealthBar();
    }

    updateExperienceRelatedUI() {
        this.updateExperienceText();
        this.updateExperienceBar();
    }

    updateHealthText() {
        this.healthText!.setText(`Health: ${this.player!.health}/${this.player!.maxHealth}`);
    }

    updateExperienceText() {
        this.experienceText!.setText(`XP: ${this.player!.experience}`);
    }

    updateHealthBar() {
        this.healthBar!.clear();
        this.healthBar!.fillStyle(0xff0000, 1); // Red color for current health
        const healthPercentage = this.player!.health / this.player!.maxHealth;
        const healthBarWidth = 200 * healthPercentage; // Calculate width
        if (healthBarWidth < 0 || healthBarWidth > 200) {
            console.error("Invalid health bar width:", healthBarWidth);
        }
        this.healthBar!.fillRect(this.cameras.main.width - 216, 16, healthBarWidth, 20).setScrollFactor(0);
    }

    updateExperienceBar() {
        this.experienceBar!.clear();
        this.experienceBar!.fillStyle(0xffff00, 1); // Yellow color for current experience
        const experiencePercentage = (this.player!.experience - this.player!.previousExperienceThreshold) / (this.player!.experienceThreshold - this.player!.previousExperienceThreshold);
        const experienceBarWidth = 200 * experiencePercentage; // Calculate width
        if (experienceBarWidth < 0 || experienceBarWidth > 200) {
            console.error("Invalid experience bar width:", experienceBarWidth);
        }
        this.experienceBar!.fillRect(this.cameras.main.width - 216, 40, experienceBarWidth, 20).setScrollFactor(0);
    }

    gameOver() {
        document.removeEventListener('visibilitychange', () => { });
        this.scene.start('GameOverScene', { score: this.score, time: this.elapsedTimeMillis, experience: this.player!.experience });
    }

    /**
     * Handles the player level up event.
     * @param {number} newLevel - The new level of the player.
     */
    onPlayerLevelUp(newLevel: number) {
        this.pauseGame();
        this.isPausedInGame = true;
        this.powerUpManager!.showPowerUpSelection(newLevel);

        // Adjust enemy spawn interval based on player level
        this.enemySpawnInterval = Math.max(50, 500 - newLevel * 10); // Decrease interval with level, minimum 50ms

        // Reset the enemy spawn event with the new interval
        if (this.enemySpawnEvent) {
            this.enemySpawnEvent.remove(false); // Remove the old event without destroying it
        }
        this.enemySpawnEvent = this.time.addEvent({
            delay: this.enemySpawnInterval,
            callback: this.createEnemies,
            callbackScope: this,
            loop: true
        });
    }

    spawnHeart() {
        const x = Phaser.Math.Between(0, this.mapSize);
        const y = Phaser.Math.Between(0, this.mapSize);
        const heart = new Heart(this, x, y);
        this.hearts!.add(heart);
    }

    collectHeart(player: Player, heart: Heart) {
        heart.collect();
        player.health = Math.min(player.maxHealth, player.health + 200); // Restore 200 health
        this.events.emit('playerHealthChanged', 200);
    }

    pauseGame() {
        console.log('Pausing game...');
        // Pause the game physics
        this.physics.pause();
        this.isPaused = true;

        // Pause the timed events
        if (this.enemySpawnEvent) this.enemySpawnEvent.paused = true;
        if (this.heartSpawnEvent) this.heartSpawnEvent.paused = true;
        this.attackEvents.forEach(event => event.paused = true);
    }

    resumeGame() {
        console.log('Resuming game...');
        // Resume the game physics
        this.physics.resume();
        this.isPaused = false;

        // Resume the timed events
        if (this.enemySpawnEvent) this.enemySpawnEvent.paused = false;
        if (this.heartSpawnEvent) this.heartSpawnEvent.paused = false;
        this.attackEvents.forEach(event => event.paused = false);
    }

    showDamageText(enemyX: number, enemyY: number, damage: number, color: string, isPlayer: boolean = false) {
        const fontSize = isPlayer ? '24px' : '18px';
        const deltaY = isPlayer ? -10 : -5;
        const duration = isPlayer ? 1000 : 500;
        const damageText = this.add.text(enemyX, enemyY, (isPlayer && damage > 0 ? '+' : '') + damage.toString(), { fontSize: fontSize, color: color, fontStyle: isPlayer ? 'bold' : '' })
            .setScrollFactor(1) // Make the text move with the camera
            .setDepth(1);

        damageText.setAlpha(1);
        this.tweens.add({
            targets: damageText,
            y: enemyY + deltaY,
            alpha: 0.7,
            duration: duration,
            onComplete: () => {
                damageText.destroy();
            }
        });
    }
}
