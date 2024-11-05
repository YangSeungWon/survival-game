import Phaser from 'phaser';
import Player from './Player';
import Enemy from './enemies/Enemy';
import { createProjectileTexture } from '../utils/TextureGenerator';
import { moveObject } from '../utils/MovementUtils';
export default class Projectile extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'projectileTexture');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setActive(false);
        this.setVisible(false);
        this.facingAngle = 0;
        this.speed = 0;
        this.attackPower = 0;
        this.owner = {};
        this.scene = scene;
    }
    fire(owner, angle, speed, attackPower, color, projectileSize) {
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
        const handleCollision = this.handleCollision;
        if (owner instanceof Player) {
            this.scene.physics.add.overlap(this, this.scene.enemies, handleCollision, null, this);
        }
        else if (owner instanceof Enemy) {
            this.scene.physics.add.overlap(this, this.scene.player, handleCollision, null, this);
        }
        else {
            alert('Projectile: Invalid target');
        }
    }
    getTextureKey(projectileSize, color) {
        return `projectileTexture_${projectileSize}_${color}`;
    }
    handleCollision(projectile, target) {
        const projectileSprite = projectile;
        const targetEntity = target;
        if (projectileSprite.active && projectileSprite.visible) {
            if ((projectileSprite.owner instanceof Player && targetEntity instanceof Enemy) ||
                (projectileSprite.owner instanceof Enemy && targetEntity instanceof Player)) {
                targetEntity.takeDamage(projectileSprite.attackPower);
                projectileSprite.setActive(false);
                projectileSprite.setVisible(false);
            }
        }
    }
    move(deltaMultiplier) {
        moveObject(this, this.facingAngle, this.speed, deltaMultiplier);
    }
}
//# sourceMappingURL=Projectile.js.map