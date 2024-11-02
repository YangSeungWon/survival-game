export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    create(data) {
        const { width, height } = this.scale;

        this.add.text(width / 2, height / 2 - 100, 'Game Over', { fontSize: '64px', fill: '#ff0000' }).setOrigin(0.5);
        this.add.text(width / 2, height / 2, `Score: ${data.score}`, { fontSize: '32px', fill: '#ffffff' }).setOrigin(0.5);
        this.add.text(width / 2, height / 2 + 50, `Time: ${Math.floor(data.time / 60000)}:${Math.floor((data.time % 60000) / 1000).toString().padStart(2, '0')}`, { fontSize: '32px', fill: '#ffffff' }).setOrigin(0.5);
        this.add.text(width / 2, height / 2 + 100, `XP: ${data.experience}`, { fontSize: '32px', fill: '#ffffff' }).setOrigin(0.5);
        this.add.text(width / 2, height / 2 + 150, 'Press Space to Restart', { fontSize: '32px', fill: '#ffffff' }).setOrigin(0.5);

        this.input.keyboard.once('keydown-SPACE', () => {
            if (this.scene.get('GameScene')) {
                const gameScene = this.scene.get('GameScene');
                gameScene.player.attacks.forEach(attack => attack.destroy());
            }
            this.scene.start('GameScene');
        });
    }
}

