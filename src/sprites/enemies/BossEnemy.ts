import Phaser from 'phaser';
import { EnemyConfig } from './Enemy';
import Enemy from './Enemy';
import Player from '../Player';
import GameScene from '../../scenes/GameScene';
import DepthManager, { DepthLayer } from '../../utils/DepthManager';
import { createMissileTexture } from '../../utils/TextureGenerator';

interface HomingMissile extends Phaser.Physics.Arcade.Sprite {
    shouldHoming: boolean;
}

interface SpreadMissile extends Phaser.Physics.Arcade.Sprite {
    shouldSpread: boolean;
}

export default class BossEnemy extends Enemy {
    private attackCooldown: number;
    private missileSpeed: number;
    private depthManager: DepthManager;
    private currentPhase: number; // Tracks the current phase
    maxHealth: number;    // Maximum health of the boss

    constructor(scene: GameScene) {
        const config: EnemyConfig = {
            color: 0xff0000,
            size: 100,
            moveSpeed: 10,
            experiencePoint: 1000,
            health: 10000,
            attackConfig: {
                attackSpeed: 1000,
                attackPower: 100,
                attackRange: 100,
                attackColor: 0xff0000,
            },
            x: 200,
            y: 200
        }
        super(scene, config);
        this.attackCooldown = 2000; // Time between attacks in milliseconds
        this.missileSpeed = 300;     // Speed of the homing missile
        this.depthManager = DepthManager.getInstance();
        this.currentPhase = 1;       // Initialize to Phase 1
        this.maxHealth = config.health; // Assuming EnemyConfig has a health property

        // Generate missile textures
        createMissileTexture(this.scene, 'simpleMissileTexture', 0xff0000, 16, 16);
        createMissileTexture(this.scene, 'homingMissileTexture', 0x00ff00, 16, 16);
        createMissileTexture(this.scene, 'spreadMissileTexture', 0x0000ff, 16, 16);

        // Initial shake effect when the boss appears
        this.scene.cameras.main.shake(500, 0.01);

        // Setup initial attack pattern
        this.setupAttackPattern(this.phaseOneAttack.bind(this));
    }

    /**
     * Phase One Attack: Fires simple missiles towards the player.
     */
    private phaseOneAttack(): void {
        const target = this.scene.player;
        if (target) {
            const missile = this.scene.physics.add.sprite(this.x, this.y, 'simpleMissileTexture');
            missile.setDepth(this.depthManager.getDepth(DepthLayer.ENEMY));

            const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
            missile.setRotation(angle);
            this.scene.physics.velocityFromRotation(angle, this.missileSpeed, missile.body!.velocity);
            missile.setCollideWorldBounds(true);
            missile.body!.onWorldBounds = true;

            // Give damage to player
            this.scene.physics.add.overlap(missile, this.scene.player!, (missileObj, playerObj) => {
                const damage = 150;
                (playerObj as Player).takeDamage(damage);
                missileObj.destroy();
            });

            // Destroy missile if it goes out of bounds
            this.scene.physics.world.on('worldbounds', (body: Phaser.Physics.Arcade.Body) => {
                if (body.gameObject === missile) {
                    missile.destroy();
                }
            });
        }
    }

    /**
     * Phase Two Attack: Fires homing missiles towards the player.
     */
    private phaseTwoAttack(): void {
        const target = this.scene.player;
        if (target) {
            const missile = this.scene.physics.add.sprite(this.x, this.y, 'homingMissileTexture') as HomingMissile;
            missile.setDepth(this.depthManager.getDepth(DepthLayer.ENEMY));
            missile.shouldHoming = true;

            // **Homing Behavior**
            this.scene.physics.moveToObject(missile, target, this.missileSpeed);

            // Update missile direction each frame to home in on the player
            this.scene.physics.world.on('worldstep', () => {
                if (missile.active && target.active && missile.shouldHoming) {
                    const distance = Phaser.Math.Distance.Between(missile.x, missile.y, target.x, target.y);
                    if (distance < 150) {
                        missile.shouldHoming = false;
                    }
                    const angle = Phaser.Math.Angle.Between(missile.x, missile.y, target.x, target.y);
                    missile.setRotation(angle);
                    this.scene.physics.moveToObject(missile, target, this.missileSpeed);
                }
            });

            // **Collision Handling**
            this.scene.physics.add.overlap(missile, this.scene.player!, (missileObj, playerObj) => {
                const damage = 150;
                (playerObj as Player).takeDamage(damage);
                missileObj.destroy();
            });

            // **Destroy missile if it goes out of bounds**
            missile.setCollideWorldBounds(true);
            this.scene.physics.world.on('worldbounds', (body: Phaser.Physics.Arcade.Body) => {
                if (body.gameObject === missile) {
                    missile.destroy();
                }
            });
        }
    }

    /**
     * Phase Three Attack: Fires multiple spread homing missiles towards the player.
     */
    private phaseThreeAttack(): void {
        const target = this.scene.player;
        if (target) {
            for (let i = 0; i < 5; i++) {
                const missile = this.scene.physics.add.sprite(this.x, this.y, 'spreadMissileTexture') as SpreadMissile;
                missile.setDepth(this.depthManager.getDepth(DepthLayer.ENEMY));
                missile.shouldSpread = true;

                // **Spread Behavior**
                const angleOffset = Phaser.Math.DegToRad(15 * (i - 2)); // Spread missiles by 15 degrees
                const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y) + angleOffset;
                missile.setRotation(angle);
                this.scene.physics.velocityFromRotation(angle, this.missileSpeed, missile.body!.velocity);

                // **Collision Handling**
                this.scene.physics.add.overlap(missile, this.scene.player!, (missileObj, playerObj) => {
                    const damage = 200;
                    (playerObj as Player).takeDamage(damage);
                    missileObj.destroy();
                });

                // **Destroy missile if it goes out of bounds**
                missile.setCollideWorldBounds(true);
                this.scene.physics.world.on('worldbounds', (body: Phaser.Physics.Arcade.Body) => {
                    if (body.gameObject === missile) {
                        missile.destroy();
                    }
                });
            }
        }
    }

    /**
     * Override update method to handle phase transitions.
     */
    update(player: Player, delta: number): void {
        super.update(player, delta);
        this.checkPhaseTransition();
    }

    /**
     * Checks and handles phase transitions based on current health.
     */
    private checkPhaseTransition(): void {
        const healthPercentage = this.health / this.maxHealth;

        if (healthPercentage <= 0.3 && this.currentPhase < 3) {
            this.currentPhase = 3;
            this.scene.cameras.main.shake(500, 0.015);
            this.switchAttackPhase(this.phaseThreeAttack.bind(this));
        } else if (healthPercentage <= 0.6 && this.currentPhase < 2) {
            this.currentPhase = 2;
            this.scene.cameras.main.shake(500, 0.015);
            this.switchAttackPhase(this.phaseTwoAttack.bind(this));
        }
    }

    /**
     * Switches the current attack pattern to the new phase's attack.
     * @param newPhaseAttack The attack method for the new phase.
     */
    private switchAttackPhase(newPhaseAttack: () => void): void {
        // Remove all existing timed events to prevent overlapping attacks
        this.scene.time.removeAllEvents();

        // Setup the new attack pattern
        this.setupAttackPattern(newPhaseAttack);
    }

    /**
     * Sets up the attack pattern with a timed event.
     * @param attackMethod The attack method to be called.
     */
    private setupAttackPattern(attackMethod: () => void): void {
        this.scene.time.addEvent({
            delay: this.attackCooldown,
            callback: attackMethod,
            callbackScope: this,
            loop: true
        });

        // Trigger an immediate attack
        attackMethod();
    }

    /**
     * Override update method if additional behaviors are needed.
     */
    // Note: The update method is already overridden above.
} 