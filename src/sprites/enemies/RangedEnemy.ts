import Phaser from 'phaser';
import Enemy from './Enemy';
import ProjectileAttack from '../../attacks/ProjectileAttack';
import GameScene from '../../scenes/GameScene';

export default class RangedEnemy extends Enemy {
    protected projectileSpeed: number;
    protected projectileColor: number;
    protected projectileSize: number;
    protected projectilePool: any;

    constructor(
        scene: GameScene,
        color: number,
        size: number,
        moveSpeed: number,
        health: number,
        attackSpeed: number,
        attackPower: number,
        attackRange: number,
        experiencePoint: number,
        projectileSpeed: number,
        projectileColor: number,
        projectileSize: number,
    ) {
        super(scene, color, size, moveSpeed, health, attackSpeed, attackPower, attackRange, experiencePoint);
        this.projectileSpeed = projectileSpeed;
        this.projectileColor = projectileColor;
        this.projectileSize = projectileSize;

        // Initialize ProjectileAttack instance
        this.attacks.push(new ProjectileAttack(scene, this, {
            attackSpeed: this.attackSpeed,
            projectileSpeed: this.projectileSpeed,
            attackPower: this.attackPower,
            projectileColor: this.projectileColor,
            projectileSize: this.projectileSize,
            attackRange: this.attackRange,
            piercingCount: 0
        }));
    }
}