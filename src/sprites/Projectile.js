import Player from './Player.js';
import Enemy from './enemies/Enemy.js';
import { createProjectileTexture } from '../utils/TextureGenerator.js';

export default class Projectile extends Phaser.Physics.Arcade.Sprite {
    /**
     * 프로젝트를 생성합니다.
     * @param {Phaser.Scene} scene - 현재 씬.
     * @param {number} x - 초기 x 좌표.
     * @param {number} y - 초기 y 좌표.
     */
    constructor(scene, x, y) {
        super(scene, x, y, 'projectileTexture');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // 초기 상태 설정
        this.setActive(false);
        this.setVisible(false);
    }

    /**
     * 프로젝트를 발사합니다.
     * @param {Phaser.Physics.Arcade.Sprite} owner - 발사체의 소유자.
     * @param {number} angle - 발사체의 방향.
     * @param {number} speed - 프로젝트의 속도.
     * @param {number} attackPower - 프로젝트가 주는 피해량.
     * @param {number} color - 발사체의 색상.
     * @param {number} projectileSize - 발사체의 크기.
     */
    fire(owner, angle, speed, attackPower, color, projectileSize) {
        // change texture, if not exist with 
        const textureKey = this.getTextureKey(projectileSize, color);
        if (!this.scene.textures.exists(textureKey)) {
            createProjectileTexture(this.scene, textureKey, color, projectileSize);
        }
        this.setTexture(textureKey);

        this.setPosition(owner.x, owner.y);
        this.setActive(true);
        this.setVisible(true);
        
        this.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
        this.attackPower = attackPower;

        this.owner = owner;

        // 발사체의 색상 설정
        this.setTint(color);

        // Adjust collision based on faction
        if (owner instanceof Player) {
            this.scene.physics.add.overlap(this, this.scene.enemies, this.handleCollision, null, this);
        } else if (owner instanceof Enemy) {
            this.scene.physics.add.overlap(this, this.scene.player, this.handleCollision, null, this);
        } else {
            alert('Projectile: Invalid target');
        }
    }

    getTextureKey(projectileSize, color) {
        return `projectileTexture_${projectileSize}_${color}`;
    }

    /**
     * 충돌 처리 메서드.
     * @param {Phaser.GameObjects.GameObject} projectile - 충돌한 프로젝트.
     * @param {Phaser.GameObjects.GameObject} target - 충돌한 타겟.
     */
    handleCollision(projectile, target) {
        if (projectile.active && projectile.visible) {
            if ((projectile.owner instanceof Player && target instanceof Enemy) ||
                (projectile.owner instanceof Enemy && target instanceof Player)) {
                // Apply damage to the target
                target.takeDamage(projectile.attackPower);

                projectile.setActive(false);
                projectile.setVisible(false);
            }   
        }
    }
}
