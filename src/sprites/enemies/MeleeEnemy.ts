import Phaser from 'phaser';
import Enemy from './Enemy';
import MeleeAttack from '../../attacks/MeleeAttack';
import GameScene from '../../scenes/GameScene';

export default class MeleeEnemy extends Enemy {
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
        attackAngle: number,
    ) {
        super(scene, color, size, moveSpeed, health, attackSpeed, attackPower, attackRange, experiencePoint);
        this.attacks.push(new MeleeAttack(scene, this, {
            attackSpeed: attackSpeed,
            attackPower: attackPower,
            attackRange: attackRange,
            attackAngle: attackAngle,
            attackColor: color
        }));
    }
}