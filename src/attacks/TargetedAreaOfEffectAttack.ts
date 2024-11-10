import Phaser from 'phaser';
import AreaOfEffectAttack, { AreaOfEffectAttackConfig } from './AreaOfEffectAttack';
import GameScene from '../scenes/GameScene';
import Character from '../sprites/Character';
import { AttackConfig } from './Attack';
import Player from '../sprites/Player';

export interface TargetedAreaOfEffectAttackConfig extends AttackConfig, AreaOfEffectAttackConfig {
}

export default class TargetedAreaOfEffectAttack extends AreaOfEffectAttack {
    constructor(scene: GameScene, owner: Character, config: TargetedAreaOfEffectAttackConfig) {
        super(scene, owner, config);
    }

    updateAttackBar(): void {
        if (this.attackCircle && !this.isAttacking) {
            this.attackCircle.setVisible(false);
        }
    }

    performAttack(): void {
        if (this.isAttacking) return;

        this.isAttacking = true;

        //get nearest enemy according to the owner's type
        const target = this.owner instanceof Player 
            ? this.scene.player!.getNearestEnemy()!
            : this.scene.player!;

        const targetX = target.x;
        const targetY = target.y;

        this.attackCircle.setPosition(targetX, targetY);
        this.attackCircle.setVisible(true);

        // Display warning circle
        this.scene.tweens.add({
            targets: this.attackCircle,
            x: targetX,
            y: targetY,
            alpha: { from: 0.2, to: 1 },
            scale: { from: 1, to: 1 },
            duration: 1000, // Duration of the warning
            onComplete: () => {
                // Apply damage after the warning
                this.applyTargetedAreaOfEffect(targetX, targetY);

                // Reset the attack circle
                this.attackCircle.setAlpha(0.3);
                this.attackCircle.setScale(1);
                this.attackCircle.setVisible(false);
            }
        });

        this.scene.time.delayedCall(this.attackSpeed, () => {
            this.isAttacking = false;
        }, [], this);
    }

    private applyTargetedAreaOfEffect(targetX: number, targetY: number): void {
        // Check if the owner is a player and if there are enemies present
        if (this.owner instanceof Player && !this.scene.enemies) return;

        // Determine the targets based on the owner type
        const targets = this.owner instanceof Player 
            ? this.scene.enemies!.getChildren() 
            : [this.scene.player];

        targets.forEach((target: any) => {
            const distance = Phaser.Math.Distance.Between(targetX, targetY, target.x, target.y);
            if (distance <= this.effectRange) {
                target.takeDamage(this.attackPower);
                if (this.statusEffect) {
                    target.applyStatusEffect(this.statusEffect);
                }
            }
        });
    }
}
