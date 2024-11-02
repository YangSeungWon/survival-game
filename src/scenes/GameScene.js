import FastEnemy from '../sprites/enemies/FastEnemy.js';
import StrongEnemy from '../sprites/enemies/StrongEnemy.js';
import GunEnemy from '../sprites/enemies/GunEnemy.js';
import ProjectilePool from '../utils/ProjectilePool.js';
import ExperiencePointPool from '../utils/ExperiencePointPool.js';
import Player from '../sprites/Player.js';
import Heart from '../sprites/Heart.js';
import PowerUpManager from '../utils/PowerUpManager.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.score = 0;
        this.elapsedTime = 0;
        this.mapSize = 2000;
        this.enemySpawnInterval = 1000; // 1 second interval
        this.heartSpawnInterval = 10000; // 10 seconds interval
    }

    preload() {
        this.load.script('rexvirtualjoystick', 'https://cdn.jsdelivr.net/npm/phaser3-rex-plugins/dist/rexvirtualjoystickplugin.min.js', true);
        // The plugin is null because it hasn't been installed yet - we've only loaded the script
        // We need to install the plugin before we can use it
        // We need to wait for the script to load before installing
        this.load.once('complete', () => {
            this.plugins.install('rexvirtualjoystick', window.rexvirtualjoystickplugin, true);
            console.log('Plugin after install:', this.plugins.get('rexvirtualjoystick'));
        });
    }

    create() {
        // Set world bounds to be larger than the visible area
        this.physics.world.setBounds(0, 0, this.mapSize, this.mapSize);

        // Create a larger background
        this.add.rectangle(this.mapSize / 2, this.mapSize / 2, this.mapSize, this.mapSize, 0x000000);

        // Draw world border
        const borderGraphics = this.add.graphics();
        borderGraphics.lineStyle(4, 0xffffff, 1); // White border with 4px thickness
        borderGraphics.strokeRect(0, 0, this.mapSize, this.mapSize);

        // Create player
        this.player = new Player(this);
        this.add.existing(this.player);
        this.physics.add.existing(this.player);
        this.player.setCollideWorldBounds(true);

        // Set camera to follow the player
        this.cameras.main.startFollow(this.player);

        // Projectile Pool 생성
        this.projectilePool = new ProjectilePool(this);

        // Experience Point Pool 생성
        this.experiencePointPool = new ExperiencePointPool(this);

        // Enemy 그룹
        this.enemies = this.physics.add.group();

        // Experience Points 그룹
        this.experiencePoints = this.physics.add.group();

        // Heart group
        this.hearts = this.physics.add.group();

        // Call createEnemies to spawn enemies initially
        this.createEnemies();

        // Store references to the timed events
        this.enemySpawnEvent = this.time.addEvent({
            delay: this.enemySpawnInterval, // 1 second
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

        // Overlap settings instead of collider
        this.physics.add.overlap(this.player, this.experiencePointPool.pool, this.collectExperience, null, this);
        this.physics.add.overlap(this.player, this.hearts, this.collectHeart, null, this);

        // Input settings
        this.cursors = this.input.keyboard.createCursorKeys();

        // Score text
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' }).setScrollFactor(0);

        // Health text
        this.healthText = this.add.text(16, 50, `Health: ${this.player.health}/${this.player.maxHealth}`, { fontSize: '32px', fill: '#f00' }).setScrollFactor(0);

        // Player stats text in the bottom-left corner
        this.playerStatsText = this.add.text(16, this.cameras.main.height - 150, '', { fontSize: '16px', fill: '#fff' }).setScrollFactor(0);

        // Time text
        this.timeText = this.add.text(16, 84, 'Time: 0:00', { fontSize: '32px', fill: '#fff' }).setScrollFactor(0);

        // Experience text
        this.experienceText = this.add.text(16, 118, 'XP: 0', { fontSize: '32px', fill: '#00ff00' }).setScrollFactor(0);

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
        if (isMobile) {
            // Add Virtual Joystick for mobile devices
            this.joystick = this.plugins.get('rexvirtualjoystick').add(this, {
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

        // Initialize PowerUpManager
        this.powerUpManager = new PowerUpManager(this, this.player);

        // Create health bar background
        this.healthBarBackground = this.add.graphics();
        this.healthBarBackground.fillStyle(0x555555, 1); // Grey color for background
        this.healthBarBackground.fillRect(this.cameras.main.width - 216, 16, 200, 20).setScrollFactor(0); // Full size of the health bar

        // Create health bar
        this.healthBar = this.add.graphics();
        this.updateHealthRelatedUI();

        // Create experience bar background
        this.experienceBarBackground = this.add.graphics();
        this.experienceBarBackground.fillStyle(0x555555, 1); // Grey color for background
        this.experienceBarBackground.fillRect(this.cameras.main.width - 216, 40, 200, 20).setScrollFactor(0); // Full size of the experience bar

        // Create experience bar
        this.experienceBar = this.add.graphics();
        this.updateExperienceRelatedUI();
    }

    createEnemies() {
        if (this.isPaused) return; // Check if the game is paused

        const enemyType = Phaser.Math.RND.pick(['FastEnemy', 'StrongEnemy', 'GunEnemy']);
        var enemy;
        if (enemyType === 'FastEnemy') {
            enemy = new FastEnemy(this);
        } else if (enemyType === 'StrongEnemy') {
            enemy = new StrongEnemy(this);
        } else if (enemyType === 'GunEnemy') {
            enemy = new GunEnemy(this);
        } else {
            console.error("Unknown enemy type: " + enemyType);
        }
        this.enemies.add(enemy);
    }

    /**
     * Handles the collection of experience points by the player.
     * @param {Player} player - The player object.
     * @param {ExperiencePoint} experience - The experience point object.
     */
    collectExperience(player, experience) {
        experience.collect();
    }

    update(time, delta) {
        if (this.isPaused) return; // Check if the game is paused

        // Update elapsed time
        this.elapsedTime += delta / 1000; // Convert delta to seconds
        const deltaNormalized = delta / 20;

        // Calculate minutes and seconds
        const minutes = Math.floor(this.elapsedTime / 60);
        const seconds = Math.floor(this.elapsedTime % 60);

        // Update time text
        this.timeText.setText(`Time: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);

        // Update player movement based on joystick if smartphone, else use keyboard
        if (this.joystick) {
            // Use joystick input
            this.player.update(this.joystickCursors, deltaNormalized, this.joystick);
        } else {
            // Use keyboard input
            this.player.update(this.cursors, deltaNormalized);
        }

        // Update each enemy
        this.enemies.getChildren().forEach(enemy => {
            enemy.update(this.player, deltaNormalized);
        });

        // Update player stats text
        var statsText = '';
        statsText += `Speed: ${this.player.speed}\n`;
        statsText += `Life Steal: ${this.player.lifeSteal}\n`;
        statsText += `Defense: ${this.player.defense}\n`;
        statsText += `Critical Hit Chance: ${this.player.critChance}\n`;
        statsText += `Attacks: ${this.player.attacks.length}`;
        this.playerStatsText.setText(statsText);
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
        this.healthText.setText(`Health: ${this.player.health}/${this.player.maxHealth}`);
    }

    updateExperienceText() {
        this.experienceText.setText(`XP: ${this.player.experience}`);
    }

    updateHealthBar() {
        this.healthBar.clear();
        this.healthBar.fillStyle(0xff0000, 1); // Red color for current health
        const healthPercentage = this.player.health / this.player.maxHealth;
        const healthBarWidth = 200 * healthPercentage; // Calculate width
        if (healthBarWidth < 0 || healthBarWidth > 200) {
            console.error("Invalid health bar width:", healthBarWidth);
        }
        this.healthBar.fillRect(this.cameras.main.width - 216, 16, healthBarWidth, 20).setScrollFactor(0);
    }

    updateExperienceBar() {
        this.experienceBar.clear();
        this.experienceBar.fillStyle(0xffff00, 1); // Yellow color for current experience
        const experiencePercentage = this.player.experience / this.player.experienceThreshold;
        const experienceBarWidth = 200 * experiencePercentage; // Calculate width
        if (experienceBarWidth < 0 || experienceBarWidth > 200) {
            console.error("Invalid experience bar width:", experienceBarWidth);
        }
        this.experienceBar.fillRect(this.cameras.main.width - 216, 40, experienceBarWidth, 20).setScrollFactor(0);
    }

    gameOver() {
        this.scene.start('GameOverScene', { score: this.score, time: this.elapsedTime, experience: this.player.experience });
    }

    /**
     * Handles the player level up event.
     * @param {number} newLevel - The new level of the player.
     */
    onPlayerLevelUp(newLevel) {
        this.pauseGame();
        this.powerUpManager.showPowerUpSelection(newLevel);
    }

    spawnHeart() {
        const x = Phaser.Math.Between(0, this.mapSize);
        const y = Phaser.Math.Between(0, this.mapSize);
        const heart = new Heart(this, x, y);
        this.hearts.add(heart);
    }

    collectHeart(player, heart) {
        heart.collect();
        player.health = Math.min(player.maxHealth, player.health + 200); // Restore 200 health
        this.events.emit('playerHealthChanged', 200);
    }

    pauseGame() {
        // Pause the game physics
        this.physics.pause();
        this.isPaused = true;

        // Pause the timed events
        this.enemySpawnEvent.paused = true;
        this.heartSpawnEvent.paused = true;
    }

    resumeGame() {
        // Resume the game physics
        this.physics.resume();
        this.isPaused = false;

        // Resume the timed events
        this.enemySpawnEvent.paused = false;
        this.heartSpawnEvent.paused = false;
    }

    showCriticalHit(x, y) {
        const critText = this.add.text(x, y - 30, 'Critical!', {
            fontSize: '16px',
            fill: '#ffcc00' // Yellow color for critical hit text
        }).setOrigin(0.5).setDepth(11);

        this.tweens.add({
            targets: critText,
            y: y - 50,
            alpha: 0,
            duration: 200,
            onComplete: () => {
                critText.destroy();
            }
        });
    }
}
