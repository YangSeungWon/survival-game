import Phaser from 'phaser';
import Enemy from '../sprites/enemies/Enemy';
import GameScene from '../scenes/GameScene';
import FastEnemy from '../sprites/enemies/FastEnemy';
import StrongEnemy from '../sprites/enemies/StrongEnemy';
import GunEnemy from '../sprites/enemies/GunEnemy';
import EliteEnemy from '../sprites/enemies/EliteEnemy';
import FireballWizard from '../sprites/enemies/FireballWizard';
import PoisonWizard from '../sprites/enemies/PoisonWizard';
import BeamShooterEnemy from '../sprites/enemies/BeamShooterEnemy';
import BossEnemy from '../sprites/enemies/BossEnemy';

export default class EnemyPool {
    private scene: GameScene;
    private enemyClasses = [
        FastEnemy,
        StrongEnemy,
        GunEnemy,
        EliteEnemy,
        FireballWizard,
        PoisonWizard,
        BeamShooterEnemy,
        BossEnemy
    ];
    private pools: Map<string, Phaser.Physics.Arcade.Group> = new Map();

    constructor(scene: GameScene) {
        this.scene = scene;
        this.preloadEnemyTextures();
        this.pools = new Map();
        for (const EnemyClass of this.enemyClasses) {
            this.pools.set(EnemyClass.TYPE, this.scene.physics.add.group());
        }
    }

    /**
     * Preloads all enemy textures to ensure they're available for pooling.
     */
    private preloadEnemyTextures() {
        this.enemyClasses.forEach(EnemyClass => {
            const instance = new EnemyClass(this.scene);
            instance.destroy(); // Clean up the temporary instance
        });
    }

    /**
     * Retrieves an enemy from the pool. If none are available, returns null.
     */
    public getEnemy(className: string): Enemy | null {
        const pool = this.pools.get(className);
        if (!pool) {
            console.error(`Pool for class ${className} not found.`);
            return null;
        }
        const enemy = pool.getFirstDead() as Enemy;
        if (enemy) {
            const EnemyClass = this.enemyClasses.find(cls => cls.TYPE === className);
            if (EnemyClass) {
                enemy.reset();
                enemy.setActive(true);
                enemy.setVisible(true);
                return enemy;
            } else {
                console.error(`Enemy class ${className} not found.`);
                return null;
            }
        } else {
            const EnemyClass = this.enemyClasses.find(cls => cls.TYPE === className);
            if (EnemyClass) {
                const enemy = new EnemyClass(this.scene);
                enemy.reset();
                return enemy;
            }
        }
        return null;
    }

    /**
     * Releases an enemy back to the pool.
     */
    public releaseEnemy(enemy: Enemy): void {
        enemy.setActive(false);
        enemy.setVisible(false);
        const pool = this.pools.get(enemy.getType());
        if (pool) {
            pool.add(enemy);
        } else {
            console.error(`Pool for class ${enemy.getType()} not found.`);
        }
    }
}
