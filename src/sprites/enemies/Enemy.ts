import Phaser from 'phaser';
import { createEnemyTexture } from '../../utils/TextureGenerator';
import { moveObject } from '../../utils/MovementUtils';
import GameScene from '../../scenes/GameScene';
import Character from '../Character';
import Player from '../Player';
import { StatusEffect } from '../../attacks/Attack';

export default class Enemy extends Character {
    attackSpeed: number;
    attackPower: number;
    attackRange: number;
    experiencePoint: number;

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

        const margin = 500; // Adjust this value as needed
        const minDistanceFromPlayer = 500; // Minimum distance from the player

        let x: number, y: number;
        do {
            x = Phaser.Math.Between(-margin, Number(scene.game.config.width) + margin);
            y = Phaser.Math.Between(-margin, Number(scene.game.config.height) + margin);
        } while (Phaser.Math.Distance.Between(x, y, scene.player!.x, scene.player!.y) < minDistanceFromPlayer);
        super(scene, x, y, textureKey, color, moveSpeed, health);

        this.attackSpeed = attackSpeed;
        this.attackPower = attackPower;
        this.attackRange = attackRange;
        this.experiencePoint = experiencePoint;
        this.facingAngle = Phaser.Math.Angle.Between(this.x, this.y, scene.player!.x, scene.player!.y);
    }

    handleHealthChanged(amount: number): void {    
        // Display damage text
        if (amount < 0) {
            this.scene.events.emit('enemyHealthChanged', {
                enemy: this,
                newHealth: this.health,
                damageDealt: -amount
            });
        }

        if (this.health <= 0) {
            this.dropExperience();
            this.destroy();
        }
    }

    update(player: Player, delta: number): void {
        if (!player) return;

        this.updateStatusEffects(delta);

        // Update attack bar position
        this.facingAngle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        this.attacks.forEach(attack => {
            attack.updateAttackBar();
        });

        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        if (distance <= this.attackRange) {
            this.attacks.forEach(attack => {
                attack.performAttack();
            });
        } else if (this.canMove) {
            moveObject(this, this.facingAngle, this.moveSpeed, delta);
        }
    }

    takeDamage(amount: number): number {
        if (!this.scene) return 0;
        
        const isCriticalHit = this.calculateCriticalHit(this.scene.player!.percentCritChance);
        const damage = isCriticalHit ? amount * 2 : amount;

        const damageDealt = super.takeDamage(damage);
        if (damageDealt > 0) {
            this.displayDamageText(damageDealt, isCriticalHit);
        }

        return damageDealt;
    }

    protected dropExperience(): void {
        if (this.scene.experiencePointPool) {
            this.scene.experiencePointPool.spawnExperience(this.x, this.y, this.experiencePoint);
        }
    }

    private displayDamageText(damage: number, isCriticalHit: boolean): void {
        const color = isCriticalHit ? 'yellow' : 'white';
        if (this.scene) {
            this.scene.showDamageText(this.x, this.y, damage, color);
        }
    }

    calculateCriticalHit(percentCritChance: number): boolean {
        return Phaser.Math.FloatBetween(0, 1) < percentCritChance / 100;
    }

    destroy(fromScene?: boolean): void {
        super.destroy(fromScene);
    }
}