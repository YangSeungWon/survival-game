import Enemy, { EnemyConfig } from './Enemy';
import ProjectileAttack, { ProjectileAttackConfig } from '../../attacks/ProjectileAttack';
import GameScene from '../../scenes/GameScene';

export default class RangedEnemy extends Enemy {
    static readonly TYPE: string;
    static readonly FROM_LEVEL: number;
    static readonly TO_LEVEL: number;

    constructor(
        scene: GameScene,
        color: number,
        size: number,
        moveSpeed: number,
        health: number,
        attackConfig: ProjectileAttackConfig,
        experiencePoint: number
    ) {
        const config: EnemyConfig = {
            color: color,
            size: size,
            moveSpeed: moveSpeed,
            health: health,
            attackConfig: attackConfig,
            experiencePoint: experiencePoint
        };
        super(scene, config);
        this.attacks.push(
            new ProjectileAttack(scene, this, config.attackConfig as ProjectileAttackConfig)
        );
    }
}