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
import FireballWizard from '../sprites/enemies/FireballWizard';
import EliteEnemy from '../sprites/enemies/EliteEnemy';
import PoisonWizard from '../sprites/enemies/PoisonWizard';
import DepthManager, { DepthLayer } from '../utils/DepthManager';
import BossEnemy from '../sprites/enemies/BossEnemy';
import { createEnemyTexture, createMissileTexture, createTrackingMissileTexture } from '../utils/TextureGenerator';
import BeamShooterEnemy from '../sprites/enemies/BeamShooterEnemy';
import EnemyPool from '../utils/EnemyPool';
import GameResultScene from './GameResultScene';

export default class GameScene extends Phaser.Scene {
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
    bossHealthBarBackground: Phaser.GameObjects.Graphics | null;
    bossHealthBar: Phaser.GameObjects.Graphics | null;
    powerUpText: Phaser.GameObjects.Text | null;
    depthManager: DepthManager;
    boss: BossEnemy | null = null;
    enemyPool: EnemyPool | null;

    hitSound: Phaser.Sound.BaseSound | null;
    hurtSound: Phaser.Sound.BaseSound | null;
    shootSound: Phaser.Sound.BaseSound | null;
    powerUpSound: Phaser.Sound.BaseSound | null;
    coinSound: Phaser.Sound.BaseSound | null;
    pickupSound: Phaser.Sound.BaseSound | null; 
    
    private defaultTextStyle: Phaser.Types.GameObjects.Text.TextStyle = {
        fontFamily: '"Noto Sans", sans-serif',
        fontSize: '32px',
        color: '#fff'
    };

    private commitHashText!: Phaser.GameObjects.Text;

    constructor() {
        super({ key: 'GameScene' });
        this.elapsedTimeMillis = 0;
        this.mapSize = 800;
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
        this.bossHealthBarBackground = null;
        this.bossHealthBar = null;
        this.powerUpText = null;
        this.depthManager = DepthManager.getInstance();
        this.enemyPool = null;

        this.hitSound = null;
        this.hurtSound = null;
        this.shootSound = null;
        this.powerUpSound = null;
        this.coinSound = null;
        this.pickupSound = null;
    }

    preload(): void {
        const audioFiles = [
            { key: 'hitSound', path: 'assets/sounds/Hit.ogg' },
            { key: 'hurtSound', path: 'assets/sounds/Hurt.ogg' },
            { key: 'shootSound', path: 'assets/sounds/Shoot.ogg' },
            { key: 'powerUpSound', path: 'assets/sounds/Powerup.ogg' },
            { key: 'coinSound', path: 'assets/sounds/Coin.ogg' },
            { key: 'pickupSound', path: 'assets/sounds/Pickup.ogg' }
        ];

        // Create a valid silent audio buffer as fallback (WAV format)
        const silentAudio = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

        // Load each audio file with error handling
        audioFiles.forEach(audio => {
            // First try to load the main audio file
            this.load.audio(audio.key, audio.path);
            
            // Add specific error handler for each audio file
            this.load.once(`filecomplete-audio-${audio.key}`, () => {
                console.log(`Successfully loaded audio: ${audio.key}`);
            });
            
            this.load.once(`loaderror-audio-${audio.key}`, () => {
                console.warn(`Failed to load audio: ${audio.key}, loading fallback`);
                // If main file fails, try loading the fallback
                this.load.audio(audio.key, silentAudio);
            });
        });

        // Global error handler as final fallback
        this.load.on('loaderror', (fileObj: any) => {
            console.warn(`Global loader error for: ${fileObj.key}`);
        });

        this.load.script('rexvirtualjoystick', 'https://cdn.jsdelivr.net/npm/phaser3-rex-plugins/dist/rexvirtualjoystickplugin.min.js');
        this.load.once('complete', () => {
            this.plugins.install('rexvirtualjoystick', (window as any).rexvirtualjoystickplugin, true);
            console.log('Plugin after install:', this.plugins.get('rexvirtualjoystick'));
        });

        // Create Boss Texture
        createEnemyTexture(this, 'bossTexture', 0xff0000, 100);

        // Create Missile Textures
        createMissileTexture(this, 'missileTexture', 0x0000ff, 10, 20);
        createTrackingMissileTexture(this, 'trackingMissileTexture', 0xffa500, 15, 30);

        this.load.json('version', 'version.json');
    }

    create(): void {
        // Improved audio creation with better error handling
        const createAudio = (key: string, volume: number): Phaser.Sound.BaseSound | null => {
            try {
                if (!this.cache.audio.exists(key)) {
                    console.warn(`Audio key "${key}" not found in cache`);
                    return null;
                }
                
                const sound = this.sound.add(key, { 
                    volume,
                    loop: false
                });
                
                // Add error handler for actual playback
                sound.on('loaderror', () => {
                    console.warn(`Error loading audio: ${key}`);
                });
                
                return sound;
            } catch (error) {
                console.warn(`Failed to create audio for ${key}:`, error);
                return null;
            }
        };

        this.hitSound = createAudio('hitSound', 0.1);
        this.hurtSound = createAudio('hurtSound', 0.3);
        this.shootSound = createAudio('shootSound', 0.1);
        this.powerUpSound = createAudio('powerUpSound', 0.25);
        this.coinSound = createAudio('coinSound', 0.25);
        this.pickupSound = createAudio('pickupSound', 0.2);

        this.player = new Player(this);
        this.enemyPool = new EnemyPool(this);
        this.player.setDepth(this.depthManager.getDepth(DepthLayer.PLAYER));
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

        this.healthText = this.add.text(16, 10, `Health: ${this.player.health}/${this.player.maxHealth}`, { ...this.defaultTextStyle, color: '#f00' })
            .setScrollFactor(0)
            .setDepth(this.depthManager.getDepth(DepthLayer.UI));
        this.playerStatsText = this.add.text(16, this.cameras.main.height - 200, '', { ...this.defaultTextStyle, fontSize: '12px' })
            .setScrollFactor(0)
            .setDepth(this.depthManager.getDepth(DepthLayer.UI));
        this.timeText = this.add.text(16, 44, 'Time: 0:00', this.defaultTextStyle)
            .setScrollFactor(0)
            .setDepth(this.depthManager.getDepth(DepthLayer.UI));
        this.experienceText = this.add.text(16, 78, 'XP: 0', { ...this.defaultTextStyle, color: '#00ff00' })
            .setScrollFactor(0)
            .setDepth(this.depthManager.getDepth(DepthLayer.UI));
        this.fpsText = this.add.text(this.cameras.main.width / 2, 8, 'FPS: 0', { ...this.defaultTextStyle, fontSize: '12px' })
            .setScrollFactor(0)
            .setDepth(this.depthManager.getDepth(DepthLayer.UI));

        this.powerUpManager = new PowerUpManager(this, this.player);

        this.healthBarBackground = this.add.graphics();
        this.healthBarBackground.fillStyle(0x555555, 1); // Grey color for background
        this.healthBarBackground.fillRect(this.cameras.main.width - 216, 16, 200, 20).setScrollFactor(0).setDepth(this.depthManager.getDepth(DepthLayer.UI)); // Full size of the health bar

        this.healthBar = this.add.graphics();
        this.healthBar.setDepth(this.depthManager.getDepth(DepthLayer.UI)); // Set depth for health bar
        this.updateHealthRelatedUI();

        this.experienceBarBackground = this.add.graphics();
        this.experienceBarBackground.fillStyle(0x555555, 1); // Grey color for background
        this.experienceBarBackground.fillRect(this.cameras.main.width - 216, 40, 200, 20).setScrollFactor(0).setDepth(this.depthManager.getDepth(DepthLayer.UI)); // Full size of the experience bar

        this.experienceBar = this.add.graphics();
        this.experienceBar.setDepth(this.depthManager.getDepth(DepthLayer.UI)); // Set depth for experience bar
        this.updateExperienceRelatedUI();

        this.powerUpText = this.add.text(100, 220, 'Power-Ups:', { fontSize: '16px', color: '#ffffff' });
        this.powerUpText.setDepth(this.depthManager.getDepth(DepthLayer.UI));
        this.powerUpText.setVisible(false);

        this.physics.world.setBounds(0, 0, this.mapSize, this.mapSize);
        this.add.rectangle(this.mapSize / 2, this.mapSize / 2, this.mapSize * 2, this.mapSize * 2, 0x222222);
        this.add.rectangle(this.mapSize / 2, this.mapSize / 2, this.mapSize, this.mapSize, 0x000000);

        const borderGraphics = this.add.graphics();
        borderGraphics.lineStyle(4, 0xffffff, 1); // White border with 4px thickness
        borderGraphics.strokeRect(0, 0, this.mapSize, this.mapSize);
        borderGraphics.setDepth(this.depthManager.getDepth(DepthLayer.UI));

        // Create player
        this.add.existing(this.player);
        this.physics.add.existing(this.player);
        this.player.setCollideWorldBounds(true);
        
        this.createEnemies();

        // Set camera to follow the player
        this.cameras.main.startFollow(this.player);

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
        const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
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
        
        const versionData = this.cache.json.get('version') as { commitHash: string };
        const commitHash = versionData?.commitHash || 'Unknown';

        // Display the commit hash at the bottom right corner
        this.commitHashText = this.add.text(
            this.cameras.main.width - 10,
            this.cameras.main.height - 10,
            `Commit: ${commitHash}`,
            {
                fontSize: '16px',
                color: '#ffffff',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                padding: { x: 5, y: 5 },
            }
        )
        .setOrigin(1, 1) // Align text to bottom-right
        .setScrollFactor(0); // Fix position to the camera

        // Optional: Update text on resize
        this.scale.on('resize', this.updateCommitHashPosition, this);
    }

    private updateCommitHashPosition(gameSize: Phaser.Structs.Size) {
        this.commitHashText.setPosition(gameSize.width - 10, gameSize.height - 10);
    }

    createEnemies() {
        if (this.isPaused || this.isPausedInGame || document.hidden) return;

        const countEnemies = this.enemies!.getChildren().length;
        console.log('createEnemies ' + countEnemies);
        const level = this.player!.level;

        if (level >= 15 && !this.boss) {
            this.bossHealthBarBackground = this.add.graphics();
            this.bossHealthBarBackground.fillStyle(0x888888, 1); // Grey color for background
            this.bossHealthBarBackground.fillRect(this.cameras.main.width - 216, 74, 200, 20).setScrollFactor(0).setDepth(this.depthManager.getDepth(DepthLayer.UI)); // Full size of the health bar

            this.bossHealthBar = this.add.graphics();
            this.bossHealthBar.setDepth(this.depthManager.getDepth(DepthLayer.UI)); // Set depth for health bar
            this.updateBossHealthRelatedUI();

            // 보스 스폰
            this.boss = new BossEnemy(this);
            this.boss.reset();
            this.enemies!.add(this.boss);
            this.updateBossHealthRelatedUI();
            return;
        }

        // 일반 적 스폰 로직
        const enemyClasses = [FastEnemy, StrongEnemy, GunEnemy, EliteEnemy, FireballWizard, PoisonWizard, BeamShooterEnemy];
        
        const availableEnemies = enemyClasses.filter(enemyClass => {
            return level >= enemyClass.FROM_LEVEL && level <= enemyClass.TO_LEVEL;
        });

        if (availableEnemies.length === 0) return;

        const EnemyClass = Phaser.Math.RND.weightedPick(availableEnemies);
        const enemy = this.enemyPool!.getEnemy(EnemyClass.TYPE);
        if (enemy) {
            enemy.setDepth(this.depthManager.getDepth(DepthLayer.ENEMY));
            this.enemies!.add(enemy);
        } else {
            console.error(`Enemy class ${EnemyClass.TYPE} not found.`);
        }
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


        this.player!.updateStatusEffects(deltaTime);

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
        console.log('projectile count:', this.projectilePool!.getProjectiles().getChildren().length);

        // Update each enemy
        this.enemies!.getChildren().forEach(enemy => {
            enemy.update(this.player, deltaTime);
        });

        this.hearts!.getChildren().forEach(heart => {
            heart.update(this.player, deltaTime);
        });

        if (this.boss) {
            this.boss.update(this.player!, deltaTime);
        }

        // Update player stats text
        var statsText = '';
        statsText += `Level: ${this.player!.level}\n`;
        if (this.boss) {
            statsText += `Boss Health: ${this.boss!.health}/${this.boss!.maxHealth}\n`;
        }
        statsText += `XP Threshold: ${this.player!.experienceThreshold}\n`;
        statsText += `Enemy Spawn Interval: ${this.enemySpawnInterval}\n`;
        statsText += `Move Speed: ${this.player!.moveSpeed}\n`;
        statsText += `Life Steal (%): ${this.player!.percentLifeSteal}\n`;
        statsText += `Defense: ${this.player!.defense}\n`;
        statsText += `Critical Hit Chance (%): ${this.player!.percentCritChance}\n`;
        statsText += `Attacks: ${this.player!.attacks.length}`;
        for (const attack of this.player!.attacks) {
            statsText += `\n\t- ${attack.constructor.name} P${attack.attackPower} S${attack.attackSpeed} R${attack.attackRange}`;
        }
        this.playerStatsText!.setText(statsText);


        const fps = Math.floor(this.game.loop.actualFps);
        this.fpsText!.setText(`FPS: ${fps}\nDelta: ${deltaMultiplier}`);

        // Calculate minutes and seconds
        const minutes = Math.floor(this.elapsedTimeMillis / 60000);
        const seconds = Math.floor((this.elapsedTimeMillis % 60000) / 1000);
        const ms = Math.floor(this.elapsedTimeMillis % 1000);

        // Update time text
        this.timeText!.setText(`Time: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}:${ms < 100 ? ms < 10 ? '00' : '0' : ''}${ms}`);

        if (this.boss) {
            this.updateBossHealthRelatedUI();
        }
    }

    updateHealthRelatedUI() {
        this.updateHealthText();
        this.updateHealthBar();
    }

    updateExperienceRelatedUI() {
        this.updateExperienceText();
        this.updateExperienceBar();
    }

    updateBossHealthRelatedUI() {
        this.updateBossHealthBar();
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

    updateBossHealthBar() {
        if (!this.boss) return;
        this.bossHealthBar!.clear();
        this.bossHealthBar!.fillStyle(0xff0000, 1); // Red color for current health
        const healthPercentage = this.boss!.health / this.boss!.maxHealth;
        const healthBarWidth = 200 * healthPercentage; // Calculate width
        this.bossHealthBar!.fillRect(this.cameras.main.width - 216, 74, healthBarWidth, 20).setScrollFactor(0);
    }

    gameOver(isSuccess: boolean = false) {
        if (this.bossHealthBar) {
            this.bossHealthBar.destroy();
        }
        if (this.bossHealthBarBackground) {
            this.bossHealthBarBackground.destroy();
        }
        // Capture the screenshot
        this.game.renderer.snapshot((image) => {
            const screenshot = (image as HTMLImageElement).src;
            
            // Start the GameResultScene with the screenshot
            this.scene.start('GameResultScene', { 
                resultData: {
                    level: this.player!.level, 
                    bossHealth: this.boss?.health,
                    bossMaxHealth: this.boss?.maxHealth,
                    time: this.elapsedTimeMillis, 
                    experience: this.player!.experience, 
                    isSuccess: isSuccess,
                    powerUps: this.powerUpManager!.selectedPowerUps,
                    screenshot: screenshot // Pass the screenshot
                }
            });
        }, 'image/jpeg', 0.8);
    }

    gameSuccess() {
        this.gameOver(true);
    }

    /**
     * Handles the player level up event.
     * @param {number} newLevel - The new level of the player.
     */
    onPlayerLevelUp(newLevel: number) {
        this.isPausedInGame = true;
        this.pauseGame();
        this.powerUpManager!.showPowerUpSelection(newLevel);

        this.sound.play('powerUpSound');

        // 맵에 ��는 모든 경험치 오브젝트 제거
        this.experiencePointPool!.clear();
        
        // 플레이어 레벨에 따라 적 스폰 간격 조정
        this.enemySpawnInterval = Math.max(50, 450 - newLevel * 18); // 레벨이 증가할수록 스폰 간격 감소, 최소 50ms

        // 새로운 스폰 간격으로 적 스폰 이벤트 재설정
        if (this.enemySpawnEvent) {
            this.enemySpawnEvent.remove(false); // 기존 이벤트 제거 (파괴하지 않음)
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
        const heart = new Heart(this);
        heart.setPosition(x, y);
        this.hearts!.add(heart);
    }

    collectHeart(player: Player, heart: Heart) {
        heart.collect();
        player.health = Math.min(player.maxHealth, player.health + player.heartRestore); // Restore 1000 health
        this.events.emit('playerHealthChanged', player.heartRestore);
    }

    pauseGame() {
        console.log('Pausing game...');
        // Pause the game physics
        this.physics.pause();
        this.isPaused = true;

        // Show power-ups when the game is paused
        this.showPowerUps();

        // Pause the timed events
        if (this.enemySpawnEvent) this.enemySpawnEvent.paused = true;
        if (this.heartSpawnEvent) this.heartSpawnEvent.paused = true;
        this.attackEvents.forEach(event => event.paused = true);
    }

    showPowerUps() {
        let text = 'Power-Ups:\n';
        this.powerUpManager!.selectedPowerUps.forEach((powerUp, index) => {
            text += `• ${powerUp}\n`;
        });
        this.powerUpText!.setText(text);


        this.powerUpText!.setVisible(true);
        this.powerUpText!.setDepth(this.depthManager.getDepth(DepthLayer.UI));
        this.powerUpText!.x = 100;
        this.powerUpText!.y = 220;
        this.powerUpText!.setScrollFactor(0);
        console.log('showPowerUps');
        console.log(this.powerUpText);
    }

    hidePowerUps() {
        if (this.powerUpText) {
            this.powerUpText.setVisible(false);
        }
    }

    resumeGame() {
        console.log('Resuming game...');
        // Resume the game physics
        this.physics.resume();
        this.isPaused = false;

        this.hidePowerUps();

        // Resume the timed events
        if (this.enemySpawnEvent) this.enemySpawnEvent.paused = false;
        if (this.heartSpawnEvent) this.heartSpawnEvent.paused = false;
        this.attackEvents.forEach(event => event.paused = false);

        // Reset lastUpdateTime to prevent large deltaTime on resume
        this.lastUpdateTime = this.time.now;
    }

    showDamageText(enemyX: number, enemyY: number, damage: number, color: string, isPlayer: boolean = false) {
        const fontSize = isPlayer ? '24px' : '18px';
        const deltaY = isPlayer ? -15 : -10;
        const duration = isPlayer ? 500 : 300;
        const damageText = this.add.text(enemyX, enemyY, (isPlayer && damage > 0 ? '+' : '') + damage.toString(), { fontSize: fontSize, color: color, fontStyle: isPlayer ? 'bold' : '' })
            .setScrollFactor(1) // Make the text move with the camera
            .setDepth(1);

        damageText.setAlpha(1);
        this.tweens.add({
            targets: damageText,
            y: enemyY + deltaY,
            alpha: 0.8,
            duration: duration,
            onComplete: () => {
                damageText.destroy();
            }
        });
    }
}
