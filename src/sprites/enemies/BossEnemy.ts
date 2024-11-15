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

// New Interface for Switching Missiles
interface SwitchingMissile extends Phaser.Physics.Arcade.Sprite {
    hasStartedHoming: boolean;
    hasApproachedPlayer: boolean;
    initialDistance: number;
}

export default class BossEnemy extends Enemy {
    private attackCooldown: number;
    private missileSpeed: number;
    private depthManager: DepthManager;
    private currentPhase: number; // Tracks the current phase
    maxHealth: number; // Maximum health of the boss
    private switchingMissiles: SwitchingMissile[] = []; // Track switching missiles

    constructor(scene: GameScene) {
        const config: EnemyConfig = {
            color: 0xff0000,
            size: 100,
            moveSpeed: 25,
            experiencePoint: 1000,
            health: 30000,
            attackConfig: {
                attackSpeed: 1000,
                attackPower: 100,
                attackRange: 100,
                attackColor: 0xff0000,
            },
            x: 0,
            y: 0
        }
        super(scene, config);
        this.attackCooldown = 1000; // Time between attacks in milliseconds
        this.missileSpeed = 300;     // Speed of the missiles
        this.depthManager = DepthManager.getInstance();
        this.currentPhase = 1;       // Initialize to Phase 1
        this.maxHealth = config.health; // Assuming EnemyConfig has a health property

        // Generate missile textures
        createMissileTexture(this.scene, 'simpleMissileTexture', 0xff0000, 10, 10);
        createMissileTexture(this.scene, 'homingMissileTexture', 0x00ff00, 10, 10);
        createMissileTexture(this.scene, 'switchingMissileTexture', 0x00ff00, 10, 10);
        createMissileTexture(this.scene, 'spreadMissileTexture', 0x0000ff, 10, 10);

        // Initial shake effect when the boss appears
        this.scene.cameras.main.shake(500, 0.01);

        // Setup initial attack pattern
        this.setupAttackPattern(this.phaseOneAttack.bind(this));

        // Listen to worldstep for updating switching missiles
        this.scene.physics.world.on('worldstep', this.updateSwitchingMissiles, this);
    }

    /**
     * Phase One Attack: Fires simple missiles towards the player's current position in four directions.
     */
    private phaseOneAttack(): void {
        const missileTexture = 'simpleMissileTexture';
        const numberOfMissiles = 8;
        const spreadAngle = Phaser.Math.DegToRad(45); // 10 degrees spread

        const target = this.scene.player;
        if (!target) {
            return;
        }

        const angleToPlayer = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);

        // Calculate the starting angle for the spread
        const startAngle = angleToPlayer + spreadAngle * (numberOfMissiles - 1) / 2 + Phaser.Math.DegToRad(22.5);

        for (let i = 0; i < numberOfMissiles; i++) {
            const angle = startAngle + spreadAngle * i;

            const missile = this.scene.physics.add.sprite(this.x, this.y, missileTexture);
            missile.setDepth(this.depthManager.getDepth(DepthLayer.ENEMY));

            missile.setRotation(angle);
            this.scene.physics.velocityFromRotation(angle, this.missileSpeed, missile.body!.velocity);
            missile.setCollideWorldBounds(true);
            missile.body!.onWorldBounds = true;

            // Handle collision with player
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
     * Phase Two Attack: Fires 11 missiles in a circular pattern that start homing after reaching a certain distance.
     */
    private phaseTwoAttack(): void {
        const missileTexture = 'switchingMissileTexture';
        const numberOfMissiles = 4;
        const angleIncrement = Phaser.Math.DegToRad(360 / numberOfMissiles);

        for (let i = 0; i < numberOfMissiles; i++) {
            const angle = i * angleIncrement;

            const missile = this.scene.physics.add.sprite(this.x, this.y, missileTexture) as SwitchingMissile;
            missile.setDepth(this.depthManager.getDepth(DepthLayer.ENEMY));
            missile.hasStartedHoming = false;
            missile.initialDistance = 0;

            // Set initial velocity straight outward
            this.scene.physics.velocityFromRotation(angle, this.missileSpeed * 0.8, missile.body!.velocity);
            missile.setRotation(angle);

            // Add to tracking array
            this.switchingMissiles.push(missile);

            // Handle collision with player
            this.scene.physics.add.overlap(missile, this.scene.player!, (missileObj, playerObj) => {
                const damage = 150;
                (playerObj as Player).takeDamage(damage);
                missileObj.destroy();
            });

            // Destroy missile if it goes out of bounds
            this.scene.physics.world.on('worldbounds', (body: Phaser.Physics.Arcade.Body) => {
                if (body.gameObject === missile) {
                    this.removeSwitchingMissile(missile);
                    missile.destroy();
                }
            });
        }
    }

    /**
     * Updates all switching missiles to handle homing behavior.
     */
    private updateSwitchingMissiles(): void {
        if (!this.scene) return;
        const target = this.scene.player;
        if (!target) return;

        this.switchingMissiles.forEach((missile) => {
            if (!missile.active) return;

            // Calculate distance from boss
            const distance = Phaser.Math.Distance.Between(missile.x, missile.y, this.x, this.y);
            if (!missile.hasStartedHoming && distance > 200) { // homingThreshold
                missile.hasStartedHoming = true;
            } else if (missile.hasStartedHoming && target.active && !missile.hasApproachedPlayer) {
                const distance = Phaser.Math.Distance.Between(missile.x, missile.y, target.x, target.y);
                const angle = Phaser.Math.Angle.Between(missile.x, missile.y, target.x, target.y);

                // Continuously adjust velocity towards player
                this.scene.physics.velocityFromRotation(angle, this.missileSpeed * 0.4, missile.body!.velocity);
                missile.setRotation(angle);

                if (distance < 300) {
                    missile.hasApproachedPlayer = true;
                    this.scene.physics.moveToObject(missile, target, this.missileSpeed);
                }
            }
        });
    }

    /**
     * Removes a missile from the tracking array.
     * @param missile The missile to remove.
     */
    private removeSwitchingMissile(missile: SwitchingMissile): void {
        const index = this.switchingMissiles.indexOf(missile);
        if (index > -1) {
            this.switchingMissiles.splice(index, 1);
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
        if (!this.scene) return;
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

    handleHealthChanged(amount: number): void {    
        // Display damage text
        if (amount < 0) {
            this.scene.events.emit('enemyHealthChanged', {
                enemy: this,
                newHealth: this.health,
                damageDealt: -amount
            });
        }

        if (this.health <= 0) {
            this.dropExperience();
            this.scene.gameSuccess();
            this.destroy();
        }
    }
} 
