import Phaser from 'phaser';
import Enemy, { EnemyConfig } from './Enemy';
import GameScene from '../../scenes/GameScene';
import TargetedAreaOfEffectAttack, { TargetedAreaOfEffectAttackConfig } from '../../attacks/TargetedAreaOfEffectAttack';

export default class AreaOfEffectEnemy extends Enemy {
    static readonly TYPE: string;
    static readonly FROM_LEVEL: number;
    static readonly TO_LEVEL: number;

    constructor(
        scene: GameScene,
        color: number,
        size: number,
        moveSpeed: number,
        health: number,
        attackConfig: TargetedAreaOfEffectAttackConfig,
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

        // Initialize ProjectileAttack instance
        this.attacks.push(
            new TargetedAreaOfEffectAttack(
                scene,
                this,
                config.attackConfig as TargetedAreaOfEffectAttackConfig
            )
        );
    }

    public getType(): string {
        return AreaOfEffectEnemy.TYPE;
    }
}
