import { createEnemyTexture } from '../../utils/TextureGenerator.js';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, color, size, moveSpeed, health, attackSpeed, attackPower, attackRange, experiencePoint) {
        // 적을 그래픽으로 생성
        const textureKey = `enemyTexture_${color}_${size}`;
        createEnemyTexture(scene, textureKey, color, size);

        const x = Phaser.Math.Between(0, scene.game.config.width);
        const y = Phaser.Math.Between(0, scene.game.config.height);

        super(scene, x, y, textureKey);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setCollideWorldBounds(true);
        this.setBounce(1);

        this.moveSpeed = moveSpeed;
        this.health = health;
        this.attackSpeed = attackSpeed;
        this.attackPower = attackPower;
        this.attackRange = attackRange;

        this.experiencePoint = experiencePoint;

        this.canAttack = true;
        this.canMove = true;

        this.facingAngle = Phaser.Math.Angle.Between(this.x, this.y, scene.player.x, scene.player.y);

        // Initialize attack bar
        this.initAttackBar(scene, Phaser.Display.Color.ValueToColor(color).lighten(20).color, attackRange, attackPower);
    }

    // Update the attack bar position
    updateAttackBar(player) {
        if (this.attackBar) {
            this.attackBar.setPosition(this.x, this.y);
        }
    }

    update(player, delta) {
        // Update attack bar position
        this.facingAngle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        this.updateAttackBar(player);
        
        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        if (distance <= this.attackRange) {
            if (this.canAttack) {
                this.attack(player);
            }
        } else if (this.canMove) {
            this.scene.physics.moveToObject(this, player, this.moveSpeed * delta);
        } else {
            this.setVelocity(0, 0);
        }
    }

    attack(player) {
        throw new Error('attack() method must be implemented by subclass');
    }

    takeDamage(amount) {
        const initialHealth = this.health;
        this.health = Math.max(this.health - amount, 0); // Ensure health doesn't go below zero

        const damageDealt = initialHealth - this.health; // Calculate the actual damage dealt

        if (damageDealt > 0) {
            // Emit an event with the actual damage dealt
            this.scene.events.emit('enemyHealthChanged', {
                enemy: this,
                newHealth: this.health,
                damageDealt: damageDealt
            });
        }

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
            this.dropExperience();
            this.destroy();
        }
    }

    /**
     * Drops experience points upon enemy death.
     */
    dropExperience() {
        if (this.scene.experiencePointPool) {
            this.scene.experiencePointPool.spawnExperience(this.x, this.y, this.experiencePoint);
        }
    }

    destroy(fromScene) {
        if (this.attackBar) {
            this.attackBar.destroy();
        }
        super.destroy(fromScene);
    }
}