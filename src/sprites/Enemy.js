export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, color, size, moveSpeed, health) {
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
    }

    update(player) {
        this.scene.physics.moveToObject(this, player, this.moveSpeed);
    }
}
