import Enemy from './enemies/Enemy.js';

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
     * @param {number} x - 발사 위치의 x 좌표.
     * @param {number} y - 발사 위치의 y 좌표.
     * @param {number} targetX - 타겟의 x 좌표.
     * @param {number} targetY - 타겟의 y 좌표.
     * @param {number} speed - 프로젝트의 속도.
     * @param {number} attackPower - 프로젝트가 주는 피해량.
     * @param {number} color - 발사체의 색상.
     * @param {number} projectileSize - 발사체의 크기.
     * @param {string} faction - 프로젝트의 팩션.
     */
    fire(x, y, targetX, targetY, speed, attackPower, color, projectileSize, faction) {
        // change texture, if not exist with 
        const textureKey = this.getTextureKey(projectileSize, color);
        if (!this.scene.textures.exists(textureKey)) {
            this.createTexture(this.scene, textureKey, color, projectileSize);
        }
        this.setTexture(textureKey);

        this.setPosition(x, y);
        this.setActive(true);
        this.setVisible(true);

        const angle = Phaser.Math.Angle.Between(x, y, targetX, targetY);
        this.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
        this.attackPower = attackPower;
        this.faction = faction; // Set the faction of the projectile

        // 발사체의 색상 설정
        this.setTint(color);

        // Adjust collision based on faction
        if (this.faction === 'player') {
            this.scene.physics.add.overlap(this, this.scene.enemies, this.handleCollision, null, this);
        } else if (this.faction === 'enemy') {
            this.scene.physics.add.overlap(this, this.scene.player, this.handleCollision, null, this);
        }
    }

    getTextureKey(projectileSize, color) {
        return `projectileTexture_${projectileSize}_${color}`;
    }

    createTexture(scene, textureKey, color, projectileSize) {
        const graphics = scene.add.graphics();
        graphics.fillStyle(color, 1);
        graphics.fillCircle(projectileSize, projectileSize, projectileSize);
        graphics.generateTexture(textureKey, projectileSize * 2, projectileSize * 2);
        graphics.destroy();
    }

    /**
     * 충돌 처리 메서드.
     * @param {Phaser.GameObjects.GameObject} projectile - 충돌한 프로젝트.
     * @param {Phaser.GameObjects.GameObject} target - 충돌한 타겟.
     */
    handleCollision(projectile, target) {
        if (projectile.active && projectile.visible) {
            if ((projectile.faction === 'player' && target instanceof Enemy)
                || (projectile.faction === 'enemy')
            ) {
                target.takeDamage(projectile.attackPower);
                projectile.setActive(false);
                projectile.setVisible(false);
            }   
        }
    }
}
