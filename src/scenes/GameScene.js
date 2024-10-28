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
        // 게임 배경
        this.add.rectangle(400, 300, 1000, 800, 0x000000);

        // 플레이어 생성
        this.player = new Player(this);
        this.add.existing(this.player);
        this.physics.add.existing(this.player);
        this.player.setCollideWorldBounds(true);

        // 에너미 그룹
        this.enemies = this.physics.add.group();
        this.createEnemies();

        // 충돌 설정
        this.physics.add.collider(this.player, this.enemies, this.hitEnemy, null, this);

        // 입력 설정
        this.cursors = this.input.keyboard.createCursorKeys();

        // 스코어 텍스트
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' });

        // 정기적으로 에너미 생성
        this.time.addEvent({
            delay: 1000, // 1초마다
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
