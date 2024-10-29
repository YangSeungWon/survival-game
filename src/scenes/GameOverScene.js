export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    create() {
        const { width, height } = this.scale;

        this.add.text(width / 2, height / 2 - 50, 'Game Over', { fontSize: '64px', fill: '#ff0000' }).setOrigin(0.5);
        this.add.text(width / 2, height / 2 + 50, 'Press Space to Restart', { fontSize: '32px', fill: '#ffffff' }).setOrigin(0.5);

        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('GameScene');
        });
    }
}

