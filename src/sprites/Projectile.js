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

        // 충돌 설정 (예: 플레이어와 충돌 시 피해 주기)
        this.scene.physics.add.overlap(this, this.scene.player, this.handleCollision, null, this);
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
     */
    fire(x, y, targetX, targetY, speed, attackPower, color, projectileSize) {
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

        // 발사체의 색상 설정
        this.setTint(color);
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
     * @param {Phaser.GameObjects.GameObject} player - 충돌한 플레이어.
     */
    handleCollision(projectile, player) {
        if (!projectile.active) return; // 이미 비활성화된 발사체는 무시

        player.takeDamage(this.attackPower);
        console.log(`플레이어가 ${this.attackPower}의 피해를 입었습니다.`);
        projectile.setActive(false);
        projectile.setVisible(false);
        projectile.body.setVelocity(0, 0);
    }
}
