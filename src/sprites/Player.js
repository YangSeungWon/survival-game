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

        // 공격 관련 변수 설정
        this.attackSpeed = 300; // 공격 속도 (밀리초)
        this.projectileSpeed = 300; // 발사체 속도
        this.attackPower = 1; // 공격력
        this.projectileColor = 0xffffff; // 발사체 색상
        this.projectileSize = 3; // 발사체 크기

        this.facingDirection = { x: 0, y: 0 }; // Add a property to store facing direction

        // 자동 공격 타이머 설정
        this.scene.time.addEvent({
            delay: this.attackSpeed,
            callback: this.shoot,
            callbackScope: this,
            loop: true
        });
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
                this.facingDirection = { x: forceX, y: forceY }; // Update facing direction
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
                this.facingDirection = { x: velocityX, y: velocityY }; // Update facing direction
            }

            this.setVelocity(velocityX * this.speed, velocityY * this.speed);
        }
    }

    shoot() {
        const { x: directionX, y: directionY } = this.facingDirection;

        this.scene.projectilePool.fireProjectile(
            this.x, 
            this.y, 
            this.x + directionX * 100, // Target X coordinate
            this.y + directionY * 100, // Target Y coordinate
            this.projectileSpeed, // Speed of the projectile
            this.attackPower,  // Attack power of the projectile
            this.projectileColor, // Color of the projectile
            this.projectileSize, // Size of the projectile
            'player'
        );
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
}
