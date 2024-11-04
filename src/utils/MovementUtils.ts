import Phaser from 'phaser';

export function moveObject(object: Phaser.Physics.Arcade.Sprite, facingAngle: number, moveSpeed: number, delta: number): void {
    if (delta > 100) {
        return;
    }

    const velocityX = Math.cos(facingAngle) * moveSpeed;
    const velocityY = Math.sin(facingAngle) * moveSpeed;

    object.x += velocityX * delta / 1000;
    object.y += velocityY * delta / 1000;
}
