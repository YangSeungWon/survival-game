import Enemy from './Enemy';
import ProjectileAttack, { ProjectileAttackConfig } from '../../attacks/ProjectileAttack';
import GameScene from '../../scenes/GameScene';
import { AttackConfig } from '../../attacks/Attack';

export default class RangedEnemy extends Enemy {
    static readonly TYPE: string;
    static readonly FROM_LEVEL: number;
    static readonly TO_LEVEL: number;

    protected projectileSpeed: number;
    protected projectileSize: number;
    protected projectilePool: any;

    constructor(
        scene: GameScene,
        color: number,
        size: number,
        moveSpeed: number,
        health: number,
        config: AttackConfig & ProjectileAttackConfig,
        experiencePoint: number
    ) {
        super(scene, color, size, moveSpeed, health, config, experiencePoint);
        this.projectileSpeed = config.projectileSpeed;
        this.projectileSize = config.projectileSize;

        // Initialize ProjectileAttack instance
        this.attacks.push(new ProjectileAttack(scene, this, config));
    }
}