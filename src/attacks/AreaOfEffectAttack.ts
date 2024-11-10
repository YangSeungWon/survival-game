import Phaser from 'phaser';
import Attack, { AttackConfig } from './Attack';
import GameScene from '../scenes/GameScene';
import Character from '../sprites/Character';
import Player from '../sprites/Player';

export interface AreaOfEffectAttackConfig extends AttackConfig {
    effectRange: number;
}

export default class AreaOfEffectAttack extends Attack {
    scene: GameScene;
    attackCircle!: Phaser.GameObjects.Ellipse;
    effectRange: number;
    
    constructor(scene: GameScene, owner: Character, config: AreaOfEffectAttackConfig) {
        super(scene, owner, config);
        this.scene = scene;
        this.effectRange = config.effectRange;
        this.initAttackBar(scene);
    }

    initAttackBar(scene: GameScene): void {
        this.attackBar = null;
        this.attackCircle = this.scene.add.ellipse(this.owner.x, this.owner.y, this.effectRange * 2, this.effectRange * 2, this.attackColor, 0.5);
        this.attackCircle.setDepth(1);
        this.attackCircle.setAlpha(0.3);
    }

    updateAttackBar(): void {
        super.updateAttackBar();
        this.attackCircle.setPosition(this.owner.x, this.owner.y);
    }

    performAttack(): void {
        if (this.isAttacking) return;

        this.isAttacking = true;

        this.applyAreaOfEffect();

        // Trigger AoE effect
        // Create a flash animation
        this.scene.tweens.add({
            targets: this.attackCircle,
            alpha: { from: 0.3, to: 1 },
            duration: 30,
            yoyo: false,
            onComplete: () => {
                this.attackCircle.setAlpha(0.3);
            }
        });

        this.scene.time.delayedCall(this.attackSpeed, () => {
            this.isAttacking = false;
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
}
