import Phaser from 'phaser';
import Projectile from '../sprites/Projectile';
import Character from '../sprites/Character';
import GameScene from '../scenes/GameScene';
import { StatusEffect } from '../attacks/Attack';

export default class ProjectilePool {
    private scene: GameScene;
    private projectiles: Phaser.Physics.Arcade.Group;

    constructor(scene: GameScene, poolSize: number = -1) {
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

    fireProjectile(
        owner: Character,
        angle: number,
        speed: number,
        attackPower: number,
        color: number,
        projectileSize: number,
        piercingCount: number,
        statusEffect: StatusEffect | null
    ): void {
        let projectile = this.projectiles.getFirstDead() as Projectile;
        // if failed to get projectile, create new one
        if (!projectile) {
            projectile = new Projectile(this.scene, owner.x, owner.y);
            this.projectiles.add(projectile);
        }
        projectile.fire(owner, angle, speed, attackPower, color, projectileSize, piercingCount, statusEffect);
    }

    preUpdate(): void {
        this.projectiles.getChildren().forEach(gameObject => {
            const projectile = gameObject as Projectile;
            const width = this.scene.game.config.width as number;
            const height = this.scene.game.config.height as number;
            // 화면 밖으로 나가면 비활성화
            if (projectile.x < 0 || projectile.x > width ||
                projectile.y < 0 || projectile.y > height) {
                projectile.setActive(false);
                projectile.setVisible(false);
            }
        });
    }

    moveAll(deltaMultiplier: number): void {
        this.projectiles.getChildren().forEach(gameObject => {
            const projectile = gameObject as Projectile;
            projectile.move(deltaMultiplier);
        });
    }

    public getProjectiles(): Phaser.Physics.Arcade.Group {
        return this.projectiles;
    }
}
