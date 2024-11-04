import Phaser from 'phaser';
import PreloadScene from './scenes/PreloadScene';
import GameScene from './scenes/GameScene';
import GameOverScene from './scenes/GameOverScene';
const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: window.location.hostname === 'localhost'
        }
    },
    scene: [PreloadScene, GameScene, GameOverScene]
};
const game = new Phaser.Game(config);
//# sourceMappingURL=main.js.map