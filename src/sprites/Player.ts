import Phaser from 'phaser';
import ProjectileAttack from '../attacks/ProjectileAttack';
import Attack, { StatusEffectType } from '../attacks/Attack';
import { moveObject } from '../utils/MovementUtils';
import GameScene from '../scenes/GameScene';
import Enemy from './enemies/Enemy';
import Character from './Character';
import { PlayerAttackStats } from '../utils/PlayerAttackStats';

export default class Player extends Character {
    percentLifeSteal: number;
    defense: number;
    percentCritChance: number;
    experience: number;
    level: number;
    previousExperienceThreshold: number;
    experienceThreshold: number;
    heartRestore: number;

    constructor(scene: Phaser.Scene) {
        const graphics = scene.add.graphics();
        const color = 0xffffff;
        graphics.fillStyle(color, 1);
        graphics.fillCircle(10, 10, 10);
        graphics.generateTexture('playerTexture', 20, 20);
        graphics.destroy();

        const x = Number(scene.game.config.width) / 2;
        const y = Number(scene.game.config.height) / 2;

        super(scene as GameScene, x, y, 'playerTexture', color, 200, 5000); // moveSpeed: 200, health: 5000

        console.log('Player initialized with scene:', this.scene);

        // Attack-related properties
        this.attacks = []; // Array to hold attack instances

        this.percentLifeSteal = 0; // Default value
        this.defense = 0; // Default value
        this.percentCritChance = 0; // Default value
        this.facingAngle = 0;

        // Initialize default attacks
        this.initDefaultAttacks();

        this.experience = 0; // Initialize experience
        this.level = 1; // Initial level
        this.previousExperienceThreshold = 0;
        this.experienceThreshold = 100; // Experience required for next level

        // Listen for enemy health change events
        this.scene.events.on('enemyHealthChanged', this.onEnemyHealthChanged, this);

        // Listen for player health change events
        this.scene.events.on('playerHealthChanged', this.onPlayerHealthChanged, this);

        // Listen for experience point collection
        this.scene.events.on('experiencePointCollected', this.addExperience, this);

        this.canAttack = true;
        this.canMove = true;
        this.heartRestore = 500;
    }

    handleHealthChanged(amount: number): void {
        this.scene.events.emit('playerHealthChanged', amount);

        if (this.health <= 0) {
            this.scene.events.emit('playerDead');
        }
    }

    initDefaultAttacks() {
        const attackStat = PlayerAttackStats.find(stat => stat.name === 'Default Attack')!;
        const projectileAttackConfig = {
            attackSpeed: attackStat.attackSpeed!,
            projectileSpeed: attackStat.projectileSpeed!,
            attackPower: attackStat.attackPower!,
            attackColor: attackStat.color,
            projectileSize: attackStat.projectileSize!,
            attackRange: attackStat.attackRange!,
            piercingCount: attackStat.piercingCount!,
        };
        const projectileAttack = new ProjectileAttack(this.scene, this, projectileAttackConfig);
        this.addAttack(projectileAttack);
    }

    /**
     * Adds a new attack to the player.
     * @param attack - An instance of an Attack subclass.
     */
    addAttack(attack: Attack) {
        this.attacks.push(attack);
    }

    /**
     * Removes an attack from the player.
     * @param attack - The attack instance to remove.
     */
    removeAttack(attack: Attack) {
        attack.destroy();
        this.attacks = this.attacks.filter(a => a !== attack);
    }

    onEnemyHealthChanged(data: { damageDealt: number }) {
        // Calculate life steal based on actual damage dealt
        const lifeStealAvailable = Math.ceil(data.damageDealt * this.percentLifeSteal / 100);
        const maxLifeStealAmount = this.maxHealth - this.health;
        const lifeStealAmount = Math.min(lifeStealAvailable, maxLifeStealAmount);
        this.scene.hitSound?.play();

        if (lifeStealAmount > 0) {
            this.health = Math.min(this.health + lifeStealAmount, this.maxHealth);
            this.scene.events.emit('playerHealthChanged', lifeStealAmount);
        }
    }

    onPlayerHealthChanged(healthChange: number) {
        this.scene.showDamageText(this.x, this.y, healthChange, healthChange > 0 ? '#00ff00' : '#ff0000', true);
        if (healthChange < 0) {
            this.scene.hurtSound?.play();
        } else if (healthChange > 100) {
            this.scene.powerUpSound?.play();
        }
    }

    move(cursors: Phaser.Types.Input.Keyboard.CursorKeys, delta: number, joystick?: any) {
        if (joystick) {
            // Normalize joystick input
            let forceX = joystick.forceX;
            let forceY = joystick.forceY;

            if (forceX !== 0 || forceY !== 0) {
                this.facingAngle = Phaser.Math.Angle.Between(this.x, this.y, this.x + forceX, this.y + forceY); // Update facing angle

                moveObject(this, this.facingAngle, this.moveSpeed, delta);
            }
        } else {
            // Keyboard input
            let velocityX = 0;
            let velocityY = 0;

            if (cursors.left.isDown) {
                velocityX = -1;
            } else if (cursors.right.isDown) {
                velocityX = 1;
            }

            if (cursors.up.isDown) {
                velocityY = -1;
            } else if (cursors.down.isDown) {
                velocityY = 1;
            }

            if (velocityX !== 0 || velocityY !== 0) {
                const moveAngle = Phaser.Math.Angle.Between(this.x, this.y, this.x + velocityX, this.y + velocityY);
                moveObject(this, moveAngle, this.moveSpeed, delta);
            }
        }

        const nearestEnemy = this.getNearestEnemy();
        if (nearestEnemy) {
            this.facingAngle = Phaser.Math.Angle.Between(this.x, this.y, nearestEnemy.x, nearestEnemy.y);

            let attackTypes: string[] = [];
            // Update all attacks
            this.attacks.forEach(attack => {
                attack.updateAttackBar();
                if (attack.isAttacking) return;
                if (!attackTypes.includes(attack.constructor.name)) {
                    attack.performAttack();
                    attackTypes.push(attack.constructor.name);
                }
            });
        }
    }

    takeDamage(amount: number): number {
        // Calculate actual damage after applying defense
        const actualDamage = Math.max(amount - this.defense, 0); // Ensure damage doesn't go below zero

        const damageDealt = super.takeDamage(actualDamage);
        return damageDealt;
    }

    // Method to find the nearest enemy
    getNearestEnemy(): Enemy | null {
        let nearestEnemy: Enemy | null = null;
        let minDistance = Infinity;

        const enemies = this.scene.enemies;
        if (enemies == null) return null;
        enemies.getChildren().forEach(object => {
            const enemy = object as Enemy;
            const distance = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
            if (distance < minDistance) {
                minDistance = distance;
                nearestEnemy = enemy;
            }
        });

        return nearestEnemy;
    }

    /**
     * Adds experience points to the player and handles leveling up.
     * @param amount - Amount of experience to add.
     */
    addExperience(amount: number) {
        if (!this.scene) {
            console.error('Scene is undefined when adding experience');
            return;
        }
        this.experience += amount;
        this.checkLevelUp();
        this.scene.events.emit('experienceUpdated', this.experience);
    }

    /**
     * Checks if the player has enough experience to level up.
     */
    checkLevelUp() {
        while (this.experience >= this.experienceThreshold) {
            this.level += 1;
            const tmpExperienceThreshold = this.experienceThreshold;
            this.experienceThreshold = Math.floor((tmpExperienceThreshold - this.previousExperienceThreshold) * 1.35) + tmpExperienceThreshold; // Increase experience threshold for next level
            this.previousExperienceThreshold = tmpExperienceThreshold;
            this.scene.events.emit('playerLevelUp', this.level);
        }
    }

    destroy(): void {
        // Clean up all attacks
        this.attacks.forEach(attack => attack.destroy());
        super.destroy();
    }
}
