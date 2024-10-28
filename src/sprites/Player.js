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
    }

    update(cursors) {
        this.setVelocity(0);

        if (cursors.left.isDown) {
            this.setVelocityX(-160);
        } else if (cursors.right.isDown) {
            this.setVelocityX(160);
        }

        if (cursors.up.isDown) {
            this.setVelocityY(-160);
        } else if (cursors.down.isDown) {
            this.setVelocityY(160);
        }
    }
}
