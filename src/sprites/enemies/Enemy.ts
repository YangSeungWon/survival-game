import Phaser from 'phaser';
import { createEnemyTexture } from '../../utils/TextureGenerator';
import { moveObject } from '../../utils/MovementUtils';
import Player from '../Player';
import GameScene from '../../scenes/GameScene';
import Attack from '../../attacks/Attack';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    scene: GameScene;
    color: number;
    moveSpeed: number;
    health: number;
    attackSpeed: number;
    attackPower: number;
    attackRange: number;
    experiencePoint: number;
    canMove: boolean;
    facingAngle: number;
    attackTool: Attack | undefined;

    constructor(
        scene: GameScene,
        color: number,
        size: number,
        moveSpeed: number,
        health: number,
        attackSpeed: number,
        attackPower: number,
        attackRange: number,
        experiencePoint: number
    ) {
        // 적을 그래픽으로 생성
        const textureKey = `enemyTexture_${color}_${size}`;
        createEnemyTexture(scene, textureKey, color, size);

        const margin = 200; // Adjust this value as needed
        const minDistanceFromPlayer = 500; // Minimum distance from the player

        let x: number, y: number;
        do {
            x = Phaser.Math.Between(-margin, Number(scene.game.config.width) + margin);
            y = Phaser.Math.Between(-margin, Number(scene.game.config.height) + margin);
        } while (Phaser.Math.Distance.Between(x, y, scene.player!.x, scene.player!.y) < minDistanceFromPlayer);

        super(scene, x, y, textureKey);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setCollideWorldBounds(true);
        this.setBounce(1);

        this.scene = scene;
        this.color = color;
        this.moveSpeed = moveSpeed;
        this.health = health;
        this.attackSpeed = attackSpeed;
        this.attackPower = attackPower;
        this.attackRange = attackRange;
        this.experiencePoint = experiencePoint;
        this.canMove = true;
        this.facingAngle = Phaser.Math.Angle.Between(this.x, this.y, scene.player!.x, scene.player!.y);
    }

    update(player: Player, delta: number): void {
        // Update attack bar position
        this.facingAngle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        this.attackTool?.updateAttackBar();

        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        if (distance <= this.attackRange) {
            this.attackTool?.performAttack();
        } else if (this.canMove && !this.attackTool?.isAttacking) {
            moveObject(this, this.facingAngle, this.moveSpeed, delta);
        }
    }

    calculateCriticalHit(critChance: number): boolean {
        return Phaser.Math.FloatBetween(0, 1) < critChance;
    }

    takeDamage(amount: number): void {
        const isCriticalHit = this.calculateCriticalHit(this.scene.player!.critChance);
        const damage = isCriticalHit ? amount * 2 : amount;
        if (isCriticalHit) {
            this.scene.showCriticalHit(this.x, this.y);
        }

        const initialHealth = this.health;
        this.health = Math.max(this.health - damage, 0); // Ensure health doesn't go below zero

        const damageDealt = initialHealth - this.health; // Calculate the actual damage dealt

        if (damageDealt > 0) {
            // Emit an event with the actual damage dealt
            this.scene.events.emit('enemyHealthChanged', {
                enemy: this,
                newHealth: this.health,
                damageDealt: damageDealt
            });
        }

        this.scene.tweens.add({
            targets: this,
            alpha: 0.5,
            duration: 20,
            yoyo: true,
            repeat: 0,
            onComplete: () => {
                this.alpha = 1; // Ensure alpha is reset to 1
            }
        });

        if (this.health <= 0) {
            this.dropExperience();
            this.destroy();
        }
    }

    /**
     * Drops experience points upon enemy death.
     */
    protected dropExperience(): void {
        if (this.scene.experiencePointPool) {
            this.scene.experiencePointPool.spawnExperience(this.x, this.y, this.experiencePoint);
        }
    }

    destroy(fromScene?: boolean): void {
        super.destroy(fromScene);
    }
}