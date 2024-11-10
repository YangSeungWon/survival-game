import Phaser from 'phaser';
import Enemy from './Enemy';
import MeleeAttack, { MeleeAttackConfig } from '../../attacks/MeleeAttack';
import GameScene from '../../scenes/GameScene';
import { AttackConfig } from '../../attacks/Attack';

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
        config: AttackConfig & MeleeAttackConfig,
        experiencePoint: number
    ) {
        super(scene, color, size, moveSpeed, health, config, experiencePoint);
        this.attacks.push(new MeleeAttack(scene, this, config));
    }
}