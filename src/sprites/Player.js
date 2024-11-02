import ProjectileAttack from '../attacks/ProjectileAttack.js';
import { moveObject } from '../utils/MovementUtils.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene) {
        const graphics = scene.add.graphics();
        const color = 0xffffff;
        graphics.fillStyle(color, 1);
        graphics.fillRect(0, 0, 20, 20);
        graphics.generateTexture('playerTexture', 20, 20);
        graphics.destroy();

        const x = scene.game.config.width / 2;
        const y = scene.game.config.height / 2;

        super(scene, x, y, 'playerTexture');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setCollideWorldBounds(true);
        this.setBounce(1);

        this.color = color;

        this.speed = 250; // 이동 속도를 변수로 설정
        this.maxHealth = 1000; // 최대 체력을 변수로 설정
        this.health = this.maxHealth; // 초기 체력 설정

        // Attack-related properties
        this.attacks = []; // Array to hold attack instances

        this.lifeSteal = 0; // 흡혈 속성 추가, 기본값은 0
        this.defense = 0; // 방어력 속성 추가, 기본값은 0
        this.critChance = 0; // 크리티컬 확률 속성 추가, 기본값은 0
        this.facingAngle = 0

        // Initialize default attacks
        this.initDefaultAttacks();

        this.experience = 0; // 경험치 초기화
        this.level = 1; // 초기 레벨 설정
        this.experienceThreshold = 100; // 레벨업을 위한 경험치 임계값

        // Listen for enemy health change events
        this.scene.events.on('enemyHealthChanged', this.onEnemyHealthChanged, this);

        // Listen for player health change events
        this.scene.events.on('playerHealthChanged', this.onPlayerHealthChanged, this);

        this.canAttack = true;
        this.canMove = true;
    }

    initDefaultAttacks() {
        // Example: Initialize a default projectile attack
        const projectileAttackConfig = {
            attackSpeed: 300,
            projectileSpeed: 400,
            attackPower: 10,
            projectileColor: 0xffffff,
            projectileSize: 4,
            attackRange: 500
        };
        const projectileAttack = new ProjectileAttack(this.scene, this, projectileAttackConfig);
        this.addAttack(projectileAttack);
    }

    /**
     * Adds a new attack to the player.
     * @param {Attack} attack - An instance of an Attack subclass.
     */
    addAttack(attack) {
        this.attacks.push(attack);
    }

    /**
     * Removes an attack from the player.
     * @param {Attack} attack - The attack instance to remove.
     */
    removeAttack(attack) {
        attack.destroy();
        this.attacks = this.attacks.filter(a => a !== attack);
    }

    onEnemyHealthChanged(data) {
        // Calculate life steal based on actual damage dealt
        const lifeStealAvailable = Math.floor(data.damageDealt * this.lifeSteal);
        const maxLifeStealAmount = this.maxHealth - this.health;
        const lifeStealAmount = Math.min(lifeStealAvailable, maxLifeStealAmount);

        if (lifeStealAmount > 0) {
            this.health = Math.min(this.health + lifeStealAmount, this.maxHealth);
            this.scene.events.emit('playerHealthChanged', lifeStealAmount);
        }
    }

    onPlayerHealthChanged(healthChange) {
        // Determine the text to display based on health change
        const text = healthChange > 0 ? `+${healthChange}` : `${healthChange}`;

        if (this.scene == undefined) return;
        // Create a text object to show the health change
        const healthChangeText = this.scene.add.text(this.x, this.y - 20, text, {
            fontSize: '16px',
            fill: healthChange > 0 ? '#99ff99' : '#ff9999' // Green for healing, red for damage
        });

        // Animate the text to move up and fade out
        this.scene.tweens.add({
            targets: healthChangeText,
            y: this.y - 40,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                healthChangeText.destroy(); // Remove the text object after animation
            }
        });
    }

    move(cursors, delta, joystick) {
        if (joystick) {
            // Normalize joystick input
            let forceX = joystick.forceX;
            let forceY = joystick.forceY;

            if (forceX !== 0 || forceY !== 0) {
                this.facingAngle = Phaser.Math.Angle.Between(this.x, this.y, this.x + forceX, this.y + forceY); // Update facing angle

                moveObject(this, this.facingAngle, this.speed, delta);
            }
        } else {
            // 키보드 입력 사용
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
                this.facingAngle = Phaser.Math.Angle.Between(this.x, this.y, this.x + velocityX, this.y + velocityY); // Update facing angle
                moveObject(this, this.facingAngle, this.speed, delta);
            }
        }


        // Update all attacks
        this.attacks.forEach(attack => {
            attack.updateAttackBar();
            attack.performAttack();
        });
    }

    takeDamage(amount) {
        // Calculate actual damage after applying defense
        const actualDamage = Math.max(amount - this.defense, 0); // Ensure damage doesn't go below zero

        this.health -= actualDamage;
        this.scene.events.emit('playerHealthChanged', -actualDamage);

        // Flash the player sprite to indicate damage
        this.scene.tweens.add({
            targets: this,
            alpha: 0.5,
            duration: 20,
            yoyo: true,
            repeat: 0,
            onComplete: () => {
                this.alpha = 1; // Ensure alpha is reset to 1
            }
        });

        if (this.health <= 0) {
            this.scene.events.emit('playerDead');
        }
    }

    /**
     * Adds experience points to the player and handles leveling up.
     * @param {number} amount - Amount of experience to add.
     */
    addExperience(amount) {
        this.experience += amount;
        this.checkLevelUp();
        this.scene.events.emit('experienceUpdated', this.experience);
    }

    /**
     * Checks if the player has enough experience to level up.
     */
    checkLevelUp() {
        while (this.experience >= this.experienceThreshold) {
            this.experience -= this.experienceThreshold;
            this.level += 1;
            this.experienceThreshold = Math.floor(this.experienceThreshold * 1.5); // 다음 레벨업 임계값 증가
            this.scene.events.emit('playerLevelUp', this.level);
        }
    }

    destroy() {
        // Clean up all attacks
        this.attacks.forEach(attack => attack.destroy());
        super.destroy();
    }
}
