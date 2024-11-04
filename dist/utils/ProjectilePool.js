import Projectile from '../sprites/Projectile';
export default class ProjectilePool {
    constructor(scene, poolSize = -1) {
        this.scene = scene;
        this.projectiles = scene.physics.add.group({
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
        let projectile = this.projectiles.getFirstDead();
        // if failed to get projectile, create new one
        if (!projectile) {
            projectile = new Projectile(this.scene, owner.x, owner.y);
            this.projectiles.add(projectile);
        }
        projectile.fire(owner, angle, speed, attackPower, color, projectileSize);
    }
    preUpdate() {
        this.projectiles.getChildren().forEach(gameObject => {
            const projectile = gameObject;
            const width = this.scene.game.config.width;
            const height = this.scene.game.config.height;
            // 화면 밖으로 나가면 비활성화
            if (projectile.x < 0 || projectile.x > width ||
                projectile.y < 0 || projectile.y > height) {
                projectile.setActive(false);
                projectile.setVisible(false);
            }
        });
    }
    moveAll(deltaMultiplier) {
        this.projectiles.getChildren().forEach(gameObject => {
            const projectile = gameObject;
            projectile.move(deltaMultiplier);
        });
    }
    getProjectiles() {
        return this.projectiles;
    }
}
//# sourceMappingURL=ProjectilePool.js.map