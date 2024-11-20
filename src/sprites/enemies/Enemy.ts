import Phaser from 'phaser';
import { createEnemyTexture } from '../../utils/TextureGenerator';
import { moveObject } from '../../utils/MovementUtils';
import GameScene from '../../scenes/GameScene';
import Character from '../Character';
import Player from '../Player';
import { AttackConfig, StatusEffect } from '../../attacks/Attack';

export interface EnemyConfig {
    color: number;
    size: number;
    moveSpeed: number;
    health: number;
    attackConfig: AttackConfig;
    experiencePoint: number;
    x?: number;
    y?: number;
}

export default class Enemy extends Character {
    config: EnemyConfig;
    attackSpeed?: number;
    attackPower?: number;
    attackRange?: number;
    attackColor?: number;
    statusEffect?: StatusEffect | null;
    experiencePoint?: number;
    static readonly TYPE: string;
    static readonly FROM_LEVEL: number;
    static readonly TO_LEVEL: number;

    constructor(scene: GameScene, config: EnemyConfig) {
        // 적을 그래픽으로 생성
        const textureKey = `enemyTexture_${config.color}_${config.size}`;
        createEnemyTexture(scene, textureKey, config.color, config.size);

        super(scene, -1000, -1000, textureKey, config.color, config.moveSpeed, config.health);
        this.config = config;
        this.active = false;
        this.visible = false;
    }

    initPosition(scene: GameScene, config: EnemyConfig): void {
        const margin = 0; // Adjust this value as needed
        const minDistanceFromPlayer = 200; // Minimum distance from the player

        let x: number, y: number;
        if (config.x && config.y) {
            x = config.x;
            y = config.y;
        } else {
            do {
                x = Phaser.Math.Between(-margin, Number(scene.mapSize) + margin);
                y = Phaser.Math.Between(-margin, Number(scene.mapSize) + margin);
            } while (Phaser.Math.Distance.Between(x, y, scene.player!.x, scene.player!.y) < minDistanceFromPlayer);
        }

        this.setPosition(x, y);
    }

    initAttack(scene: GameScene, config: EnemyConfig): void {
        this.attackSpeed = config.attackConfig.attackSpeed;
        this.attackPower = config.attackConfig.attackPower;
        this.attackRange = config.attackConfig.attackRange;
        this.attackColor = config.attackConfig.attackColor;
        this.statusEffect = config.attackConfig.statusEffect || null;
        this.experiencePoint = config.experiencePoint;
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
            this.visible = false;
            this.active = false;
        }
    }

    update(player: Player, delta: number): void {
        if (!player) return;
        if (!this.visible) {
            this.destroy();
        }

        this.updateStatusEffects(delta);

        // Update attack bar position
        this.facingAngle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        this.attacks.forEach(attack => {
            attack.updateAttackBar();
        });

        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        if (distance <= this.attackRange!) {
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
            this.scene.experiencePointPool.spawnExperience(this.x, this.y, this.experiencePoint!);
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

    /**
     * Resets the enemy to its default state before being reused.
     */
    public reset(): void {
        this.health = this.maxHealth;
        this.statusEffects.clear();
        this.initPosition(this.scene, this.config);
        this.initAttack(this.scene, this.config);
        this.active = true;
        this.visible = true;
    }


    public getType(): string {
        return "Enemy";
    }
}
