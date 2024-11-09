import Phaser from 'phaser';
import Attack, { AttackConfig } from './Attack';
import GameScene from '../scenes/GameScene';
import { createAttackBarTexture } from '../utils/TextureGenerator';
import Character from '../sprites/Character';
import Player from '../sprites/Player';

export interface AreaOfEffectAttackConfig {
}

export default class AreaOfEffectAttack extends Attack {
    scene: GameScene;

    constructor(scene: GameScene, owner: Character, config: AttackConfig & AreaOfEffectAttackConfig) {
        super(scene, owner, config);
        this.scene = scene;
        this.initAttackBar(scene);
    }

    initAttackBar(scene: GameScene): void {
        const barLength = this.attackRange * 2;
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
        this.attackBar.setDisplaySize(this.attackRange * 2, this.attackBar.height);
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
        // Check if the owner is a player and if there are enemies present
        if (this.owner instanceof Player && !this.scene.enemies) return;

        // Determine the targets based on the owner type
        const targets = this.owner instanceof Player 
            ? this.scene.enemies!.getChildren() 
            : [this.scene.player];

        targets.forEach((target: any) => {
            const distance = Phaser.Math.Distance.Between(this.owner.x, this.owner.y, target.x, target.y);
            if (distance <= this.attackRange) {
                target.takeDamage(this.attackPower);
                if (this.statusEffect) {
                    target.applyStatusEffect(this.statusEffect);
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
