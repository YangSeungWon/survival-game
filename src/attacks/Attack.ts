import Phaser from 'phaser';
import GameScene from '../scenes/GameScene';
import Character from '../sprites/Character';
import DepthManager, { DepthLayer } from '../utils/DepthManager';

export interface AttackConfig {
    attackRange: number;
    attackSpeed: number;
    attackPower: number;
    attackColor: number;
    statusEffect?: StatusEffect | null;
}

export interface StatusEffect {
    type: StatusEffectType;
    duration: number;
    id: string;
    tickRate?: number;
    lastTick?: number;
}

export enum StatusEffectType {
    BURN = 'burn',
    FREEZE = 'freeze',
    POISON = 'poison',
    STUN = 'stun',
}

export default abstract class Attack {
    scene: GameScene;
    owner: Character;
    attackRange: number;
    attackSpeed: number;
    attackPower: number;
    attackColor: number;
    isAttacking: boolean;
    attackBar!: Phaser.Physics.Arcade.Sprite | Phaser.GameObjects.Sprite | null;
    statusEffect: StatusEffect | null;

    constructor(scene: GameScene, owner: Character, config: AttackConfig) {
        this.scene = scene;
        this.owner = owner;
        this.attackRange = config.attackRange;
        this.attackSpeed = config.attackSpeed;
        this.attackPower = config.attackPower;
        this.attackColor = config.attackColor;
        this.statusEffect = config.statusEffect || null;
        this.isAttacking = false;
    }

    initAttackBar(scene: GameScene, barKey: string): void {
        this.attackBar = scene.physics.add.sprite(this.owner.x, this.owner.y, barKey);
        this.attackBar.setOrigin(0, 1);
        this.attackBar.setDepth(this.owner.depth + 1);
        this.attackBar.setVisible(true);
        this.attackBar.setDepth(DepthManager.getInstance().getDepth(DepthLayer.ENEMY));
    }

    updateAttackBar(): void {
        if (this.attackBar) {
            this.attackBar.setPosition(this.owner.x, this.owner.y);
            if (!this.isAttacking) {
                this.attackBar.setRotation(this.owner.facingAngle);
            }
        }
    }

    abstract performAttack(): void;

    destroy(): void {
        // 서브클래스에서 오버라이드 가능
    }
}
