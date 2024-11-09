import Phaser from 'phaser';
import Attack from './Attack';
import Player from '../sprites/Player';
import GameScene from '../scenes/GameScene';
import Enemy from '../sprites/enemies/Enemy';
import { AttackConfig } from './Attack';
import { createAttackBarTexture } from '../utils/TextureGenerator';

interface MeleeConfig {
    attackAngle: number;
}

export default class MeleeAttack extends Attack {
    scene: GameScene;
    private attackAngle: number;
    private initialFacingAngle: number | null = null;

    constructor(scene: GameScene, owner: Player | Enemy, config: AttackConfig & MeleeConfig) {
        super(scene, owner, config);
        this.scene = scene;
        this.attackAngle = Phaser.Math.DegToRad(config.attackAngle || 40); // Default to 40 degrees if not provided
        this.initAttackBar(scene);
    }

    initAttackBar(scene: GameScene): void {
        const barLength = this.attackRange;
        const barHeight = 5 + this.attackPower * 0.01; // Thickness of the bar
        const barKey = `attackBar_${this.constructor.name}_${this.owner.color}_${barLength}_${barHeight}`;
        createAttackBarTexture(scene, barKey, this.owner.color, barLength, barHeight);
        super.initAttackBar(scene, barKey);

        this.attackBar.setVisible(false);
    }

    performAttack(): void {
        if (this.isAttacking) return;

        this.isAttacking = true;

        this.initialFacingAngle = (this.owner as any).facingAngle;

        this.showAttackMotion();

        this.giveDamage();

        this.scene.attackEvents.push(this.scene.time.delayedCall(this.attackSpeed, () => {
            this.isAttacking = false;
        }, [], this));
    }

    private showAttackMotion(): void {
        this.attackBar.setPosition(this.owner.x, this.owner.y);

        const facingAngle = this.initialFacingAngle!;
        const halfArc = this.attackAngle / 2;
        this.attackBar.setRotation(facingAngle - halfArc);
        this.attackBar.setVisible(true);

        this.scene.tweens.add({
            targets: this.attackBar,
            rotation: facingAngle + halfArc,
            duration: 100,
            yoyo: false,
            onComplete: () => {
                if (this.attackBar) {
                    this.attackBar.setVisible(false);
                    this.initialFacingAngle = null;
                }
            }
        });
    }

    private giveDamage(): void {
        const target = this.owner instanceof Player ? this.scene.enemies : this.scene.player;
        const attackAngle = this.initialFacingAngle!;
        const halfArc = this.attackAngle / 2;

        if (target instanceof Phaser.Physics.Arcade.Group) {
            target.getChildren().forEach((enemy: any) => {
                const angleToTarget = Phaser.Math.Angle.Between(
                    this.owner.x, 
                    this.owner.y,
                    enemy.x, 
                    enemy.y
                );

                let angleDiff = Math.abs(Phaser.Math.Angle.Wrap(angleToTarget - attackAngle));
                const distance = Phaser.Math.Distance.Between(
                    this.owner.x,
                    this.owner.y,
                    enemy.x,
                    enemy.y
                );

                if (distance <= this.attackRange && angleDiff <= halfArc) {
                    enemy.takeDamage(this.attackPower);
                }
            });
        } else {
            const angleToTarget = Phaser.Math.Angle.Between(
                this.owner.x,
                this.owner.y,
                target!.x,
                target!.y
            );

            let angleDiff = Math.abs(Phaser.Math.Angle.Wrap(angleToTarget - attackAngle));
            const distance = Phaser.Math.Distance.Between(
                this.owner.x,
                this.owner.y,
                target!.x,
                target!.y
            );

            if (distance <= this.attackRange && angleDiff <= halfArc) {
                target!.takeDamage(this.attackPower);
            }
        }
    }

    destroy(): void {
        if (this.attackBar) {
            this.attackBar.destroy();
        }
        super.destroy();
    }
}
