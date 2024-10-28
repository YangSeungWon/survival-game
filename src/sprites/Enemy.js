export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, color, size, moveSpeed, health, attackSpeed, attackPower, attackRange) {
        if (!scene.textures.exists('enemyTexture' + size + color)) {
            const graphics = scene.add.graphics();
            graphics.fillStyle(color, 1);
            graphics.fillRect(0, 0, size, size);
            graphics.generateTexture('enemyTexture' + size + color, size, size);
            graphics.destroy();
        }

        const x = Phaser.Math.RND.pick([0, scene.game.config.width]);
        const y = Phaser.Math.RND.pick([0, scene.game.config.height]);

        super(scene, x, y, 'enemyTexture' + size + color);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setCollideWorldBounds(true);
        this.setBounce(1);
        
        this.moveSpeed = moveSpeed;
        this.health = health;

        // New properties for attack
        this.attackSpeed = attackSpeed; // Time between attacks in milliseconds
        this.attackPower = attackPower; // Damage per attack
        this.attackRange = attackRange; // Distance within which enemy can attack

        this.canAttack = true; // Flag to control attack cooldown
    }

    update(player) {
        this.scene.physics.moveToObject(this, player, this.moveSpeed);

        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        if (distance <= this.attackRange && this.canAttack) {
            this.attack(player);
        }
    }

    attack(player) {
        // Inflict damage to the player
        player.takeDamage(this.attackPower);

        // Disable attacking until cooldown is over
        this.canAttack = false;

        // Re-enable attacking after attackSpeed duration
        this.scene.time.delayedCall(this.attackSpeed, () => {
            this.canAttack = true;
        }, [], this);
    }
}
