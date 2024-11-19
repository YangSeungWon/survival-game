import Phaser from 'phaser';
import Attack from './Attack';
import GameScene from '../scenes/GameScene';
import { AttackConfig } from './Attack';
import { createAttackBarTexture } from '../utils/TextureGenerator';
import Character from '../sprites/Character';
import Player from '../sprites/Player';

export interface MeleeAttackConfig extends AttackConfig {
    attackAngle: number;
}

export default class MeleeAttack extends Attack {
    scene: GameScene;
    private attackAngle: number;
    private initialFacingAngle: number | null = null;

    constructor(scene: GameScene, owner: Character, config: MeleeAttackConfig) {
        super(scene, owner, config);
        this.scene = scene;
        this.attackAngle = Phaser.Math.DegToRad(config.attackAngle);
        this.initAttackBar(scene);
    }

    initAttackBar(scene: GameScene): void {
        const barLength = this.attackRange;
        const barHeight = 5 + this.attackPower * 0.01; // Thickness of the bar
        const barKey = `attackBar_${this.constructor.name}_${this.attackColor}_${barLength}_${barHeight}`;
        createAttackBarTexture(scene, barKey, this.attackColor, barLength, barHeight);
        super.initAttackBar(scene, barKey);

        this.attackBar!.setVisible(false);
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
        this.attackBar!.setPosition(this.owner.x, this.owner.y);
        if (this.owner instanceof Player) {
            this.scene.shootSound?.play();
        }

        const facingAngle = this.initialFacingAngle!;
        const halfArc = this.attackAngle / 2;
        this.attackBar!.setRotation(facingAngle - halfArc);
        this.attackBar!.setVisible(true);

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
        const targets = this.owner instanceof Player 
            ? this.scene.enemies!.getChildren() 
            : [this.scene.player];
        const attackAngle = this.initialFacingAngle!;
        const halfArc = this.attackAngle / 2;

        targets.forEach((target: any) => {
            const angleToTarget = Phaser.Math.Angle.Between(
                this.owner.x,
                this.owner.y,
                target.x,
                target.y
            );

            let angleDiff = Math.abs(Phaser.Math.Angle.Wrap(angleToTarget - attackAngle));
            const distance = Phaser.Math.Distance.Between(
                this.owner.x,
                this.owner.y,
                target.x,
                target.y
            );

            if (distance <= this.attackRange && angleDiff <= halfArc) {
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
