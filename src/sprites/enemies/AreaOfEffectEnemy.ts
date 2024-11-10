import Phaser from 'phaser';
import Enemy from './Enemy';
import GameScene from '../../scenes/GameScene';
import TargetedAreaOfEffectAttack, { TargetedAreaOfEffectAttackConfig } from '../../attacks/TargetedAreaOfEffectAttack';
import { AttackConfig } from '../../attacks/Attack';

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
        config: AttackConfig & TargetedAreaOfEffectAttackConfig,
        experiencePoint: number
    ) {
        super(scene, color, size, moveSpeed, health, config, experiencePoint);

        // Initialize ProjectileAttack instance
        this.attacks.push(new TargetedAreaOfEffectAttack(scene, this, config));
    }
}
