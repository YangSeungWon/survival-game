export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene) {
        const graphics = scene.add.graphics();
        const COLOR = 0x00ff00;
        graphics.fillStyle(COLOR, 1);
        graphics.fillRect(0, 0, 50, 50);
        graphics.generateTexture('playerTexture', 50, 50);
        graphics.destroy();

        const x = scene.game.config.width / 2;
        const y = scene.game.config.height / 2;

        super(scene, x, y, 'playerTexture');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setCollideWorldBounds(true);
        this.setBounce(1);

        this.speed = 160; // 이동 속도를 변수로 설정
    }

    update(cursors) {
        this.setVelocity(0);

        let velocityX = 0;
        let velocityY = 0;

        if (cursors.left.isDown) {
            velocityX = -1;
        } else if (cursors.right.isDown) {
            velocityX = 1;
        }

        if (cursors.up.isDown) {
            velocityY = -1;
        } else if (cursors.down.isDown) {
            velocityY = 1;
        }

        // 벡터의 길이를 계산
        const length = Math.sqrt(velocityX * velocityX + velocityY * velocityY);

        // 벡터의 길이가 0이 아닐 때만 정규화
        if (length !== 0) {
            velocityX /= length;
            velocityY /= length;
        }

        // 정규화된 벡터에 speed를 곱하여 속도 설정
        this.setVelocity(velocityX * this.speed, velocityY * this.speed);
    }
}
