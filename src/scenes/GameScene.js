import FastEnemy from '../sprites/enemies/FastEnemy.js';
import StrongEnemy from '../sprites/enemies/StrongEnemy.js';
import GunEnemy from '../sprites/enemies/GunEnemy.js';
import ProjectilePool from '../utils/ProjectilePool.js';
import ExperiencePointPool from '../utils/ExperiencePointPool.js'; // Import the pool
import Player from '../sprites/Player.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.score = 0;
        this.elapsedTime = 0;
        this.playerExperience = 0; // Initialize player experience
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
        this.physics.world.setBounds(0, 0, 2000, 2000);

        // Create a larger background
        this.add.rectangle(1000, 1000, 2000, 2000, 0x000000);

        // Draw world border
        const borderGraphics = this.add.graphics();
        borderGraphics.lineStyle(4, 0xffffff, 1); // White border with 4px thickness
        borderGraphics.strokeRect(0, 0, 2000, 2000);

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

        // 적 생성 함수 설정
        this.time.addEvent({
            delay: 1000, // 매초
            callback: this.createEnemies,
            callbackScope: this,
            loop: true
        });

        // Overlap settings instead of collider
        this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);
        this.physics.add.overlap(this.player, this.experiencePointPool.pool, this.collectExperience, null, this);

        // Input settings
        this.cursors = this.input.keyboard.createCursorKeys();

        // Score text
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' }).setScrollFactor(0);

        // Health text
        this.healthText = this.add.text(16, 50, 'Health: 100', { fontSize: '32px', fill: '#f00' }).setScrollFactor(0);

        // Time text
        this.timeText = this.add.text(16, 84, 'Time: 0:00', { fontSize: '32px', fill: '#fff' }).setScrollFactor(0);

        // Experience text
        this.experienceText = this.add.text(16, 118, 'XP: 0', { fontSize: '32px', fill: '#00ff00' }).setScrollFactor(0);

        // Listen to health changes
        this.events.on('playerHealthChanged', this.updateHealthText, this);

        // Listen to experience collection
        this.events.on('experienceCollected', this.addPlayerExperience, this);

        // Listen to game over
        this.events.on('playerDead', this.gameOver, this);

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
    }

    createEnemies() {
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
        // Update elapsed time
        this.elapsedTime += delta / 1000; // Convert delta to seconds

        // Calculate minutes and seconds
        const minutes = Math.floor(this.elapsedTime / 60);
        const seconds = Math.floor(this.elapsedTime % 60);

        // Update time text
        this.timeText.setText(`Time: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);

        // Update player movement based on joystick if smartphone, else use keyboard
        if (this.joystick) {
            // Use joystick input
            this.player.update(this.joystickCursors, this.joystick);
        } else {
            // Use keyboard input
            this.player.update(this.cursors);
        }

        // Update each enemy
        this.enemies.getChildren().forEach(enemy => {
            enemy.update(this.player);
        });

        // Update experience points if needed
        // (Handled by the pool)
    }

    updateHealthText(health) {
        this.healthText.setText('Health: ' + this.player.health);
    }

    /**
     * Adds experience to the player.
     * @param {number} amount - Amount of experience to add.
     */
    addPlayerExperience(amount) {
        this.playerExperience += amount;
        this.score += amount; // Optionally add to score
        this.scoreText.setText('Score: ' + this.score);
        this.experienceText.setText('XP: ' + this.playerExperience);

        // Optionally handle leveling up
        this.player.addExperience(amount);
    }

    gameOver() {
        this.scene.start('GameOverScene', { score: this.score, time: this.elapsedTime, experience: this.playerExperience });
    }
}
