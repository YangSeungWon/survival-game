export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene) {
        const graphics = scene.add.graphics();
        const COLOR = 0xffffff;
        graphics.fillStyle(COLOR, 1);
        graphics.fillRect(0, 0, 40, 40);
        graphics.generateTexture('playerTexture', 40, 40);
        graphics.destroy();

        const x = scene.game.config.width / 2;
        const y = scene.game.config.height / 2;

        super(scene, x, y, 'playerTexture');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setCollideWorldBounds(true);
        this.setBounce(1);

        this.speed = 160; // 이동 속도를 변수로 설정
        this.maxHealth = 100; // 최대 체력을 변수로 설정
        this.health = this.maxHealth; // 초기 체력 설정

        // 공격 관련 변수 설정
        this.attackSpeed = 300; // 공격 속도 (밀리초)
        this.projectileSpeed = 300; // 발사체 속도
        this.attackPower = 1; // 공격력
        this.projectileColor = 0xffffff; // 발사체 색상
        this.projectileSize = 3; // 발사체 크기

        
        this.lifeSteal = 0; // 흡혈 속성 추가, 기본값은 0

        this.facingDirection = { x: 0, y: 0 }; // Add a property to store facing direction

        // 자동 공격 타이머 설정
        this.scene.time.addEvent({
            delay: this.attackSpeed,
            callback: this.shoot,
            callbackScope: this,
            loop: true
        });

        this.experience = 0; // Initialize experience
        this.level = 1; // Initialize level (optional)

        // Listen for enemy health change events
        this.scene.events.on('enemyHealthChanged', this.onEnemyHealthChanged, this);

        // Listen for player health change events
        this.scene.events.on('playerHealthChanged', this.onPlayerHealthChanged, this);
    }

    onEnemyHealthChanged(data) {
        // Calculate life steal based on actual damage dealt
        const lifeStealAvailable = data.damageDealt * this.lifeSteal;
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
        this.scene.events.emit('playerHealthChanged', -amount);

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
     * Adds experience points to the player.
     * @param {number} amount - Amount of experience to add.
     */
    addExperience(amount) {
        this.experience += amount;
        // Check for level up if implementing levels
        // Example:
        // if (this.experience >= this.level * 100) {
        //     this.levelUp();
        // }
    }

    /**
     * Optional: Handles leveling up.
     */
    levelUp() {
        // TODO: Implement leveling up logic
    }
}
