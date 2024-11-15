import Phaser from 'phaser';
import Enemy from './Enemy';
import MeleeAttack, { MeleeAttackConfig } from '../../attacks/MeleeAttack';
import GameScene from '../../scenes/GameScene';
import { AttackConfig } from '../../attacks/Attack';
import { EnemyConfig } from './Enemy';
export default class MeleeEnemy extends Enemy {
    static readonly TYPE: string;
    static readonly FROM_LEVEL: number;
    static readonly TO_LEVEL: number;

    constructor(
        scene: GameScene,
        color: number,
        size: number,
        moveSpeed: number,
        health: number,
        attackConfig: MeleeAttackConfig,
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
            new MeleeAttack(scene, this, config.attackConfig as MeleeAttackConfig)
        );
    }
}