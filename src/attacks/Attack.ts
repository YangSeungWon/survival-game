import Phaser from 'phaser';
import GameScene from '../scenes/GameScene';
import Character from '../sprites/Character';

export interface AttackConfig {
    attackRange: number;
    attackSpeed: number;
    attackPower: number;
}

export default abstract class Attack {
    scene: GameScene;
    owner: Character;
    attackRange: number;
    attackSpeed: number;
    attackPower: number;
    isAttacking: boolean;
    attackBar!: Phaser.Physics.Arcade.Sprite | Phaser.GameObjects.Sprite;

    constructor(scene: GameScene, owner: Character, config: AttackConfig) {
        this.scene = scene;
        this.owner = owner;
        this.attackRange = config.attackRange;
        this.attackSpeed = config.attackSpeed;
        this.attackPower = config.attackPower;
        this.isAttacking = false;
    }

    initAttackBar(scene: GameScene, barKey: string): void {
        this.attackBar = scene.physics.add.sprite(this.owner.x, this.owner.y, barKey);
        this.attackBar.setOrigin(0, 1);
        this.attackBar.setDepth(this.owner.depth + 1);
        this.attackBar.setVisible(true);
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
