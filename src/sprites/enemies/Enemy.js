export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, color, size, moveSpeed, health, attackSpeed, attackPower, attackRange) {
        // 적을 그래픽으로 생성
        const textureKey = `enemyTexture_${color}_${size}`;
        if (!scene.textures.exists(textureKey)) {
            const graphics = scene.add.graphics();
            graphics.fillStyle(color, 1);
            graphics.fillCircle(size, size, size);
            graphics.generateTexture(textureKey, size * 2, size * 2);
            graphics.destroy();
        }

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

        this.canAttack = true;
        this.canMove = true;
    }

    update(player) {
        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        if (distance <= this.attackRange) {
            if (this.canAttack) {
                this.attack(player);
            }
        } else if (this.canMove) {
            this.scene.physics.moveToObject(this, player, this.moveSpeed);
        } else {
            this.setVelocity(0, 0);
        }
    }

    attack(player) {
        throw new Error('attack() method must be implemented by subclass');
    }

    takeDamage(amount) {
        this.health -= amount;

        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            duration: 20,
            yoyo: true,
            repeat: 0,
            onComplete: () => {
                this.alpha = 1; // Ensure alpha is reset to 1
            }
        });

        if (this.health <= 0) {
            this.destroy();
        }
    }
}