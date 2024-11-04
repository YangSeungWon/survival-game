import Phaser from 'phaser';
import RangedEnemy from './RangedEnemy';
import GameScene from '../../scenes/GameScene';

export default class GunEnemy extends RangedEnemy {
    constructor(scene: GameScene) {
        const color: number = 0x5555ff;   
        const size: number = 10;
        const speed: number = 50;
        const health: number = 20;
        
        // 공격 속성 정의
        const attackSpeed: number = 500; 
        const attackPower: number = 10;
        const attackRange: number = 300;

        const experiencePoint: number = 10;

        const projectileSpeed: number = 300;    
        const projectileColor: number = 0xababff;
        const projectileSize: number = 5;       

        super(scene, color, size, speed, health, attackSpeed, attackPower, attackRange, experiencePoint, projectileSpeed, projectileColor, projectileSize);
    }
}