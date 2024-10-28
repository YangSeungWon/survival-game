import FastEnemy from '../sprites/enemies/FastEnemy.js';
import StrongEnemy from '../sprites/enemies/StrongEnemy.js';
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

        // Enemy group
        this.enemies = this.physics.add.group();
        this.createEnemies();

        // Collision settings
        this.physics.add.collider(this.player, this.enemies, this.hitEnemy, null, this);

        // Input settings
        this.cursors = this.input.keyboard.createCursorKeys();

        // Score text
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' }).setScrollFactor(0);

        // Regularly create enemies
        this.time.addEvent({
            delay: 1000, // Every second
            callback: this.createEnemies,
            callbackScope: this,
            loop: true
        });
    }

    createEnemies() {
        const enemyType = Phaser.Math.RND.pick(['FastEnemy', 'StrongEnemy']);
        if (enemyType === 'FastEnemy') {
            this.enemies.add(new FastEnemy(this));
        } else {
            this.enemies.add(new StrongEnemy(this));
        }
    }

    update() {
        if (this.player) {
            this.player.update(this.cursors);
        }

        this.enemies.getChildren().forEach(enemy => {
            enemy.update(this.player);
        });
    }

    hitEnemy(player, enemy) {
        enemy.disableBody(true, true);
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);
    }
}
