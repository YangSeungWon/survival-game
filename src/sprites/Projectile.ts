import Phaser from 'phaser';
import Player from './Player';
import Enemy from './enemies/Enemy';
import { createProjectileTexture } from '../utils/TextureGenerator';
import { moveObject } from '../utils/MovementUtils';
import GameScene from '../scenes/GameScene';

export default class Projectile extends Phaser.Physics.Arcade.Sprite {
    scene: GameScene;
    facingAngle: number;
    speed: number;
    attackPower: number;
    owner: Player | Enemy;

    constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, 'projectileTexture');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setActive(false);
        this.setVisible(false);
        this.facingAngle = 0;
        this.speed = 0;
        this.attackPower = 0;
        this.owner = {} as Player | Enemy;
        this.scene = scene;
    }

    fire(
        owner: Player | Enemy,
        angle: number,
        speed: number,
        attackPower: number,
        color: number,
        projectileSize: number
    ): void {
        const textureKey = this.getTextureKey(projectileSize, color);
        if (!this.scene.textures.exists(textureKey)) {
            createProjectileTexture(this.scene, textureKey, color, projectileSize);
        }
        this.setTexture(textureKey);

        this.setPosition(owner.x, owner.y);
        this.setActive(true);
        this.setVisible(true);

        this.facingAngle = angle;
        this.speed = speed;
        this.attackPower = attackPower;

        this.owner = owner;

        this.setTint(color);

        const handleCollision = this.handleCollision as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback;
        if (owner instanceof Player) {
            this.scene.physics.add.overlap(this, this.scene.enemies!, handleCollision, null as any, this);
        } else if (owner instanceof Enemy) {
            this.scene.physics.add.overlap(this, this.scene.player!, handleCollision, null as any, this);
        } else {
            alert('Projectile: Invalid target');
        }
    }

    getTextureKey(projectileSize: number, color: number): string {
        return `projectileTexture_${projectileSize}_${color}`;
    }

    handleCollision(
        projectile: Phaser.Types.Physics.Arcade.GameObjectWithBody,
        target: Phaser.Types.Physics.Arcade.GameObjectWithBody
    ): void {
        const projectileSprite = projectile as Projectile;
        const targetEntity = target as Player | Enemy;
        if (projectileSprite.active && projectileSprite.visible) {
            if (
                (projectileSprite.owner instanceof Player && targetEntity instanceof Enemy) ||
                (projectileSprite.owner instanceof Enemy && targetEntity instanceof Player)
            ) {
                targetEntity.takeDamage(projectileSprite.attackPower);

                projectileSprite.setActive(false);
                projectileSprite.setVisible(false);
            }
        }
    }

    move(deltaMultiplier: number): void {
        moveObject(this, this.facingAngle, this.speed, deltaMultiplier);
    }
}
