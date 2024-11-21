import Phaser from 'phaser';
import PreloadScene from './scenes/PreloadScene';
import GameScene from './scenes/GameScene';
import GameOverScene from './scenes/GameResultScene';
import { Types } from 'phaser';
import EnemyStatsScene from './scenes/EnemyStatsScene';
import PowerUpAndAttackStatsScene from './scenes/PowerUpStatsScene';

const config: Types.Core.GameConfig = {
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
    scene: [PreloadScene, GameScene, GameOverScene, EnemyStatsScene, PowerUpAndAttackStatsScene]
};

const game = new Phaser.Game(config);
