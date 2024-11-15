import Phaser from 'phaser';
import Attack, { AttackConfig } from './Attack';
import GameScene from '../scenes/GameScene';
import Character from '../sprites/Character';
import { StatusEffect, StatusEffectType } from './Attack';
import { DepthLayer } from '../utils/DepthManager';
import DepthManager from '../utils/DepthManager';
import Enemy from '../sprites/enemies/Enemy';

/**
 * Configuration interface for BeamAttack.
 */
export interface BeamAttackConfig extends AttackConfig {
    beamDuration: number; // Duration the beam stays active in milliseconds
    beamWidth: number;    // Width of the beam
}

/**
 * BeamAttack class that targets the farthest enemy within range and shoots a beam.
 */
export default class BeamAttack extends Attack {
    private beamDuration: number;
    private beamWidth: number;
    private beamGraphics!: Phaser.GameObjects.Graphics;

    constructor(scene: GameScene, owner: Character, config: BeamAttackConfig) {
        super(scene, owner, config);
        this.beamDuration = config.beamDuration;
        this.beamWidth = config.beamWidth;
        this.initBeamGraphics();
    }

    /**
     * Initializes the graphics object used to render the beam.
     */
    private initBeamGraphics(): void {
        this.beamGraphics = this.scene.add.graphics({
            lineStyle: { width: this.beamWidth, color: this.attackColor }
        });
        this.beamGraphics.setDepth(DepthManager.getInstance().getDepth(DepthLayer.ENEMY));
        this.beamGraphics.setVisible(false);
    }

    /**
     * Finds the farthest enemy within the attack range.
     */
    private findFarthestEnemy(): Character | null {
        let farthestEnemy: Character | null = null;
        let maxDistance = 0;

        // if the owner is enemy, find the player
        if (this.owner instanceof Enemy) {
            return this.scene.player!;
        }

        this.scene.enemies!.getChildren().forEach((enemy: any) => {
            const distance = Phaser.Math.Distance.Between(this.owner.x, this.owner.y, enemy.x, enemy.y);
            if (distance > maxDistance && distance <= this.attackRange) {
                farthestEnemy = enemy;
                maxDistance = distance;
            }
        });

        return farthestEnemy;
    }

    /**
     * Performs the beam attack.
     */
    performAttack(): void {
        if (this.isAttacking) return;

        const target = this.findFarthestEnemy();
        if (!target) return; // No enemy in range

        this.isAttacking = true;

        // Show the beam
        this.beamGraphics.setVisible(true);
        this.beamGraphics.clear();
        this.beamGraphics.lineStyle(2, this.attackColor, 1);
        this.beamGraphics.beginPath();
        this.beamGraphics.moveTo(this.owner.x, this.owner.y);
        this.beamGraphics.lineTo(target.x, target.y);
        this.beamGraphics.strokePath();

        // Apply damage to the target
        target.takeDamage(this.attackPower);
        if (this.statusEffect) {
            target.applyStatusEffect(this.statusEffect);
        }

        // Hide the beam after beamDuration
        this.scene.time.delayedCall(this.beamDuration, () => {
            this.beamGraphics.setVisible(false);
            this.isAttacking = false;
        }, [], this);
    }

    /**
     * Updates the beam's position if the owner moves while attacking.
     */
    updateAttackBar(): void {
        if (this.isAttacking && this.beamGraphics.visible) {
            const target = this.findFarthestEnemy();
            if (target) {
                this.beamGraphics.clear();
                this.beamGraphics.lineStyle(2, this.attackColor, 1);
                this.beamGraphics.beginPath();
                this.beamGraphics.moveTo(this.owner.x, this.owner.y);
                this.beamGraphics.lineTo(target.x, target.y);
                this.beamGraphics.strokePath();
            } else {
                // If the target is no longer in range, hide the beam
                this.beamGraphics.setVisible(false);
                this.isAttacking = false;
            }
        }
    }

    /**
     * Clean up graphics when the attack is destroyed.
     */
    destroy(): void {
        if (this.beamGraphics) {
            this.beamGraphics.destroy();
        }
        super.destroy();
    }
}