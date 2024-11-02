import Projectile from '../sprites/Projectile.js';

export default class ProjectilePool {
    constructor(scene, poolSize = -1) {
        this.scene = scene;
        this.pool = scene.physics.add.group({
            classType: Projectile,
            maxSize: poolSize,
            runChildUpdate: true
        });

        // default projectile 텍스처 생성
        if (!scene.textures.exists('projectileTexture')) {
            const graphics = scene.add.graphics();
            graphics.fillStyle(0xffffff, 1);
            graphics.fillCircle(2.5, 2.5, 2.5); // 중앙에 원 그리기
            graphics.generateTexture('projectileTexture', 5, 5);
            graphics.destroy();
        }
    }

    fireProjectile(owner, angle, speed, attackPower, color, projectileSize) {
        var projectile = this.pool.getFirstDead();
        // if failed to get projectile, create new one
        if (!projectile) {
            projectile = new Projectile(this.scene, owner.x, owner.y);
            this.pool.add(projectile);
        }
        projectile.fire(owner, angle, speed, attackPower, color, projectileSize);
    }

    preUpdate() {
        this.pool.getChildren().forEach(projectile => {
            // 화면 밖으로 나가면 비활성화
            if (projectile.x < 0 || projectile.x > this.scene.game.config.width ||
                projectile.y < 0 || projectile.y > this.scene.game.config.height) {
                projectile.setActive(false);
                projectile.setVisible(false);
            }
        });
    }

    moveAll(deltaMultiplier) {
        this.pool.getChildren().forEach(projectile => {
            projectile.move(deltaMultiplier);
        });
    }
}
