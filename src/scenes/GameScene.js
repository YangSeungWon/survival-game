import FastEnemy from '../sprites/enemies/FastEnemy.js';
import StrongEnemy from '../sprites/enemies/StrongEnemy.js';
import GunEnemy from '../sprites/enemies/GunEnemy.js';
import ProjectilePool from '../utils/ProjectilePool.js';
import Player from '../sprites/Player.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.score = 0;
    }

    preload() {
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

        // Enemy 그룹
        this.enemies = this.physics.add.group();

        // 적 생성 함수 설정
        this.time.addEvent({
            delay: 1000, // 매초
            callback: this.createEnemies,
            callbackScope: this,
            loop: true
        });

        // Overlap settings instead of collider
        this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);

        // Input settings
        this.cursors = this.input.keyboard.createCursorKeys();

        // Score text
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' }).setScrollFactor(0);

        // Health text
        this.healthText = this.add.text(16, 50, 'Health: 100', { fontSize: '32px', fill: '#f00' }).setScrollFactor(0);

        // Listen to health changes
        this.events.on('playerHealthChanged', this.updateHealthText, this);
        this.events.on('playerDead', this.gameOver, this);
    }

    createEnemies() {
        const enemyType = Phaser.Math.RND.pick(['FastEnemy', 'StrongEnemy', 'GunEnemy']);
        if (enemyType === 'FastEnemy') {
            this.enemies.add(new FastEnemy(this));
        } else if (enemyType === 'StrongEnemy') {
            this.enemies.add(new StrongEnemy(this));
        } else if (enemyType === 'GunEnemy') {
            this.enemies.add(new GunEnemy(this, this.projectilePool));
        }
    }

    hitEnemy(player, enemy) {
    }

    update(time, delta) {
        this.player.update(this.cursors);

        // Update each enemy
        this.enemies.getChildren().forEach(enemy => {
            enemy.update(this.player);
        });
    }

    updateHealthText(health) {
        this.healthText.setText('Health: ' + health);
    }

    gameOver() {
        this.scene.start('GameOverScene');
    }
}
