import Phaser from 'phaser';
import Attack, { AttackConfig } from './Attack';
import GameScene from '../scenes/GameScene';
import Character from '../sprites/Character';
import Player from '../sprites/Player';
import DepthManager, { DepthLayer } from '../utils/DepthManager';
import Projectile from '../sprites/Projectile';

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
        this.attackCircle.setAlpha(0.4);
        this.attackCircle.setDepth(DepthManager.getInstance().getDepth(DepthLayer.ENEMY));  

        // Trigger AoE effect
        // Create a flash animation
        this.scene.tweens.add({
            targets: this.attackCircle,
            alpha: { from: 1, to: 0 },
            duration: 200,
            yoyo: true,
            loop: 5,
            onComplete: () => {
                this.attackCircle.setAlpha(0.4);
            }
        });
    }

    updateAttackBar(): void {
        super.updateAttackBar();
        this.attackCircle.setPosition(this.owner.x, this.owner.y);
    }

    performAttack(): void {
        if (this.isAttacking) return;

        this.isAttacking = true;

        this.applyAreaOfEffect();

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

        const projectiles = this.scene.projectilePool?.getProjectiles().getChildren();
        projectiles?.forEach((projectile: Object) => {
            const projectileSprite = projectile as Projectile;
            const distance = Phaser.Math.Distance.Between(this.owner.x, this.owner.y, projectileSprite.x, projectileSprite.y);
            if (projectileSprite.owner !== this.owner && this.statusEffect && distance <= this.attackRange) {
                console.log('Applying status effect to projectile');
                projectileSprite.applyStatusEffect(this.statusEffect);
            }
        });
    }
}
