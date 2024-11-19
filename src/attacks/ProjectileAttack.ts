import Phaser from 'phaser';
import Attack, { AttackConfig } from './Attack';
import GameScene from '../scenes/GameScene';
import { createAttackBarTexture } from '../utils/TextureGenerator';
import Character from '../sprites/Character';
import Player from '../sprites/Player';

export interface ProjectileAttackConfig extends AttackConfig {
    projectileSpeed: number;
    projectileSize: number;
    piercingCount: number;
}

export default class ProjectileAttack extends Attack {
    scene: GameScene;
    private projectileSpeed: number;
    private projectileSize: number;
    private piercingCount: number;
    constructor(scene: GameScene, owner: Character, config: ProjectileAttackConfig) {
        super(scene, owner, config);

        this.scene = scene;
        this.projectileSpeed = config.projectileSpeed;
        this.projectileSize = config.projectileSize;
        this.piercingCount = config.piercingCount;
        this.initAttackBar(scene);
    }

    initAttackBar(scene: GameScene): void {
        const barLength = 20 + this.attackRange * 0.01;
        const barHeight = 5 + this.attackPower * 0.01; // Thickness of the bar
        const barKey = `attackBar_${this.constructor.name}_${this.attackColor}_${barLength}_${barHeight}`;
        createAttackBarTexture(scene, barKey, this.attackColor, barLength, barHeight);
        super.initAttackBar(scene, barKey);
    }
    
    performAttack(): void {
        if (this.isAttacking) return;

        if (this.owner instanceof Player) {
            this.scene.shootSound?.play();
        }   

        this.isAttacking = true;

        // Show and animate the attack bar
        this.attackBar!.setPosition(this.owner.x, this.owner.y);

        // Scale the attack bar down and then back up
        this.scene.tweens.add({
            targets: this.attackBar,
            scaleX: 0.5, // Scale down to 50%
            scaleY: 0.5,
            duration: 100,
            yoyo: true
        });

        // Fire the projectile towards the player
        this.scene.projectilePool!.fireProjectile(
            this.owner,
            Phaser.Math.DegToRad(this.attackBar!.angle),
            this.projectileSpeed,
            this.attackPower,
            this.attackColor,
            this.projectileSize,
            this.piercingCount,
            this.statusEffect,
            this.attackRange
        );

        // Reset attack state after attackSpeed delay
        this.scene.time.delayedCall(this.attackSpeed, () => {
            this.isAttacking = false;
        }, [], this);
    }

    destroy(): void {
        if (this.attackBar) {
            this.attackBar.destroy();
        }
        super.destroy();
    }
}
