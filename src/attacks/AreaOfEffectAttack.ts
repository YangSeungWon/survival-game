import Phaser from 'phaser';
import Attack, { AttackConfig } from './Attack';
import GameScene from '../scenes/GameScene';
import { createAttackBarTexture } from '../utils/TextureGenerator';
import Character from '../sprites/Character';
import Player from '../sprites/Player';

export interface AreaOfEffectAttackConfig {
    radius: number;
    statusEffect?: string; // e.g., 'burn', 'freeze'
}

export default class AreaOfEffectAttack extends Attack {
    scene: GameScene;
    private radius: number;
    private statusEffect?: string;

    constructor(scene: GameScene, owner: Character, config: AttackConfig & AreaOfEffectAttackConfig) {
        super(scene, owner, config);
        this.scene = scene;
        this.radius = config.radius;
        this.statusEffect = config.statusEffect;
        this.initAttackBar(scene);
    }

    initAttackBar(scene: GameScene): void {
        const barLength = this.radius * 2;
        const barHeight = 5 + this.attackPower * 0.01;
        const barKey = `attackBar_${this.constructor.name}_${this.owner.color}_${barLength}_${barHeight}`;
        createAttackBarTexture(scene, barKey, this.owner.color, barLength, barHeight);
        super.initAttackBar(scene, barKey);
    }

    performAttack(): void {
        if (this.isAttacking) return;

        this.isAttacking = true;

        // Show the AoE attack bar
        this.attackBar.setPosition(this.owner.x, this.owner.y);
        this.attackBar.setDisplaySize(this.radius * 2, this.attackBar.height);
        this.attackBar.setVisible(true);

        // Trigger AoE effect
        this.applyAreaOfEffect();

        // Reset attack state after attackSpeed delay
        this.scene.time.delayedCall(this.attackSpeed, () => {
            this.isAttacking = false;
            this.attackBar.setVisible(false);
        }, [], this);
    }

    private applyAreaOfEffect(): void {
        if (this.owner instanceof Player && !this.scene.enemies) return;
        // Determine targets within the radius
        const targets = this.owner instanceof Player ? this.scene.enemies!.getChildren() : [this.scene.player];

        targets.forEach((target: any) => {
            const distance = Phaser.Math.Distance.Between(this.owner.x, this.owner.y, target.x, target.y);
            if (distance <= this.radius) {
                target.takeDamage(this.attackPower);
                if (this.statusEffect && target instanceof Character) {
                    // Apply the status effect for a duration, e.g., 3000ms
                    target.applyStatusEffect(this.statusEffect, 3000);
                }
            }
        });
    }

    destroy(): void {
        if (this.attackBar) {
            this.attackBar.destroy();
        }
        super.destroy();
    }
}
