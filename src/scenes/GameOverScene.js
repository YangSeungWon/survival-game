export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    create() {
        this.add.text(400, 300, 'Game Over', { fontSize: '64px', fill: '#ff0000' }).setOrigin(0.5);
        this.add.text(400, 400, 'Press Space to Restart', { fontSize: '32px', fill: '#ffffff' }).setOrigin(0.5);

        this.input.keyboard.once('keydown_SPACE', () => {
            this.scene.start('GameScene');
        });
    }
}

