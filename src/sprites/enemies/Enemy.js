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

        this.color = color;

        this.moveSpeed = moveSpeed;
        this.health = health;
        this.attackSpeed = attackSpeed;
        this.attackPower = attackPower;
        this.attackRange = attackRange;

        this.experiencePoint = experiencePoint;

        this.canMove = true;

        this.facingAngle = Phaser.Math.Angle.Between(this.x, this.y, scene.player.x, scene.player.y);
    }

    update(player, delta) {
        // Update attack bar position
        this.facingAngle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        this.attackTool.updateAttackBar();
        
        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        if (distance <= this.attackRange) {
            this.setVelocity(0, 0);
            this.attackTool.performAttack(player);
        } else if (this.canMove && !this.attackTool.isAttacking) {
            this.scene.physics.moveToObject(this, player, this.moveSpeed * delta);
        } else {
            this.setVelocity(0, 0);
        }
    }

    calculateCriticalHit(critChance) {
        return Phaser.Math.FloatBetween(0, 1) < critChance;
    }

    takeDamage(amount) {
        const isCriticalHit = this.calculateCriticalHit(this.scene.player.critChance);
        const damage = isCriticalHit ? amount * 2 : amount;
        if (isCriticalHit) {
            this.scene.showCriticalHit(this.x, this.y);
        }

        const initialHealth = this.health;
        this.health = Math.max(this.health - damage, 0); // Ensure health doesn't go below zero

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