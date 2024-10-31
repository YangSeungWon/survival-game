import FastEnemy from '../sprites/enemies/FastEnemy.js';
import StrongEnemy from '../sprites/enemies/StrongEnemy.js';
import GunEnemy from '../sprites/enemies/GunEnemy.js';
import ProjectilePool from '../utils/ProjectilePool.js';
import ExperiencePointPool from '../utils/ExperiencePointPool.js';
import Player from '../sprites/Player.js';
import Heart from '../sprites/Heart.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.score = 0;
        this.elapsedTime = 0;
        this.playerExperience = 0;
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

        // Optionally, set up a timed event to spawn enemies periodically
        this.time.addEvent({
            delay: this.enemySpawnInterval, // 1 seconds
            callback: this.createEnemies,
            callbackScope: this,
            loop: true
        });

        // Example: Add a heart every 10 seconds
        this.time.addEvent({
            delay: this.heartSpawnInterval, // 10 seconds
            callback: this.spawnHeart,
            callbackScope: this,
            loop: true
        });

        // Overlap settings instead of collider
        this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);
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
        this.events.on('playerHealthChanged', this.updateHealthText, this);

        // Listen to experience collection
        this.events.on('experienceCollected', this.addPlayerExperience, this);

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

        // Update health text
        this.healthText.setText(`Health: ${this.player.health}/${this.player.maxHealth}`);

        // Update player stats text
        var statsText = '';
        statsText += `Speed: ${this.player.speed}\n`;
        statsText += `Attack Power: ${this.player.attackPower}\n`;
        statsText += `Attack Speed: ${this.player.attackSpeed}\n`;
        statsText += `Projectile Speed: ${this.player.projectileSpeed}\n`;
        statsText += `Life Steal: ${this.player.lifeSteal}`;
        this.playerStatsText.setText(statsText);
    }

    updateHealthText(health) {
        this.healthText.setText('Health: ' + this.player.health);
    }

    /**
     * Adds experience to the player and checks for level up.
     * @param {number} amount - Amount of experience to add.
     */
    addPlayerExperience(amount) {
        this.playerExperience += amount;
        this.score += amount; // Optionally add to score
        this.scoreText.setText('Score: ' + this.score);
        this.experienceText.setText('XP: ' + this.playerExperience);

        // 경험치 추가 및 레벨업 체크
        this.player.addExperience(amount);
    }

    gameOver() {
        this.scene.start('GameOverScene', { score: this.score, time: this.elapsedTime, experience: this.playerExperience });
    }

    /**
     * Handles the player level up event.
     * @param {number} newLevel - The new level of the player.
     */
    onPlayerLevelUp(newLevel) {
        // 일시정지
        this.physics.pause();
        this.isPaused = true;
        this.player.setTint(0xfff000); // 레벨업 시 플레이어 색상 변경 (옵션)

        // 파워업 선택 UI 표시
        this.showPowerUpSelection(newLevel);
    }

    /**
     * Displays the power-up selection UI with 3 options.
     * @param {number} level - The new level of the player.
     */
    showPowerUpSelection(level) {
        // Calculate center positions
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        // Add a semi-transparent background
        this.powerUpBackground = this.add.rectangle(
            centerX, 
            centerY, 
            400, 
            350, // Adjusted height to accommodate the options
            0x000000, 
            0.7
        ).setDepth(10);

        // Add text
        this.add.text(
            centerX, 
            centerY - 160, // Adjusted position for the options
            `Level ${level}! Choose a Power-Up:`, 
            { fontSize: '24px', fill: '#ffffff' }
        ).setOrigin(0.5).setDepth(11);

        // Define all power-up options
        const allPowerUps = [
            { name: 'Health Boost', description: 'Increase maximum health by 200.', apply: () => this.player.maxHealth += 200 },
            { name: 'Speed Boost', description: 'Increase movement speed by 40.', apply: () => this.player.speed += 40 },
            { name: 'Attack Power Boost', description: 'Increase attack power by 5.', apply: () => this.player.attackPower += 5 },
            { name: 'Life Steal', description: 'Gain health equal to 10% of damage dealt.', apply: () => this.player.lifeSteal = 0.1 }
        ];

        // Shuffle the array and select the first 3 power-ups
        Phaser.Utils.Array.Shuffle(allPowerUps);
        const selectedPowerUps = allPowerUps.slice(0, 3);

        selectedPowerUps.forEach((powerUp, index) => {
            const buttonY = centerY - 80 + index * 80; // Adjusted starting position

            // Button background
            const button = this.add.rectangle(
                centerX, 
                buttonY, 
                200, 
                50, 
                0x555555
            ).setInteractive().setDepth(11);

            // Button text
            this.add.text(
                centerX, 
                buttonY, 
                powerUp.name, 
                { fontSize: '20px', fill: '#ffffff' }
            ).setOrigin(0.5).setDepth(11);

            // Apply power-up on button click
            button.on('pointerdown', () => {
                powerUp.apply();
                this.closePowerUpSelection();
            });
        });

        // Cancel button (optional)
        const cancelY = centerY + 140; // Adjusted position for the options
        const cancelButton = this.add.rectangle(
            centerX, 
            cancelY, 
            100, 
            40, 
            0xff4444
        ).setInteractive().setDepth(11);
        this.add.text(
            centerX, 
            cancelY, 
            'Cancel', 
            { fontSize: '18px', fill: '#ffffff' }
        ).setOrigin(0.5).setDepth(11);

        cancelButton.on('pointerdown', () => {
            this.closePowerUpSelection();
        });
    }

    /**
     * Closes the power-up selection UI and resumes the game.
     */
    closePowerUpSelection() {
        // UI 요소 제거
        this.powerUpBackground.destroy();
        this.children.getAll().forEach(child => {
            if (child.depth === 10 || child.depth === 11) {
                child.destroy();
            }
        });

        // 색상 초기화
        this.player.clearTint();

        // 게임 재개
        this.physics.resume();
        this.isPaused = false;
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
}
