import Phaser from 'phaser';
import RangedEnemy from './RangedEnemy';
import GameScene from '../../scenes/GameScene';

export default class FireballWizard extends RangedEnemy {
    constructor(scene: GameScene) {
        const color: number = 0xff5500;   // A fiery color
        const size: number = 12;          // Slightly larger size
        const speed: number = 70;         // Slower speed
        const health: number = 150;       // Moderate health
        
        // 공격 속성 정의
        const attackSpeed: number = 2000;  // Slower attack speed
        const attackPower: number = 1500;  // Higher attack power
        const attackRange: number = 200;  // Longer attack range

        const experiencePoint: number = 20; // More experience points

        const projectileSpeed: number = 150; // Slower projectile speed
        const projectileSize: number = 10;   // Larger projectile size

        super(scene, color, size, speed, health, attackSpeed, attackPower, attackRange, experiencePoint, projectileSpeed, projectileSize);
    }
}
