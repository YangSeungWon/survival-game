export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene) {
        const graphics = scene.add.graphics();
        const COLOR = 0x00ff00;
        graphics.fillStyle(COLOR, 1);
        graphics.fillRect(0, 0, 50, 50);
        graphics.generateTexture('playerTexture', 50, 50);
        graphics.destroy();

        const x = scene.game.config.width / 2;
        const y = scene.game.config.height / 2;

        super(scene, x, y, 'playerTexture');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setCollideWorldBounds(true);
        this.setBounce(1);

        this.speed = 160; // 이동 속도를 변수로 설정
        this.health = 100; // 초기 체력 설정
    }

    update(cursors, joystick) {
        if (joystick) {
            // Normalize joystick input
            let forceX = joystick.forceX;
            let forceY = joystick.forceY;
            const length = Math.sqrt(forceX * forceX + forceY * forceY);

            if (length !== 0) {
                forceX /= length;
                forceY /= length;
            }

            this.setVelocity(forceX * this.speed, forceY * this.speed);
        } else {
            // 키보드 입력 사용
            this.setVelocity(0);

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

            const length = Math.sqrt(velocityX * velocityX + velocityY * velocityY);

            if (length !== 0) {
                velocityX /= length;
                velocityY /= length;
            }

            this.setVelocity(velocityX * this.speed, velocityY * this.speed);
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        this.scene.events.emit('playerHealthChanged', this.health);

        // Flash the player sprite to indicate damage
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
            this.scene.events.emit('playerDead');
        }
    }

    shoot(scene) {
        // Implement shooting logic, e.g., firing a projectile
        // scene.projectilePool.fireProjectile(this.x, this.y, /* target coordinates */, /* other parameters */);
    }
}
