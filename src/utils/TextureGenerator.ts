import Phaser from 'phaser';

export function createAttackBarTexture(scene: Phaser.Scene, key: string, color: number, length: number, height: number = 4): void {
    if (!scene.textures.exists(key)) {
        const graphics = scene.add.graphics();
        graphics.fillStyle(color, 1);
        graphics.fillRect(0, 0, length, height);
        graphics.generateTexture(key, length, height);
        graphics.destroy();
    }
}

export function createProjectileTexture(scene: Phaser.Scene, key: string, color: number, size: number): void {
    if (!scene.textures.exists(key)) {
        const graphics = scene.add.graphics();
        graphics.fillStyle(color, 1);

        // Calculate the points for a hexagon
        const hexagon = [];
        for (let i = 0; i < 6; i++) {
            const angle = Phaser.Math.DegToRad(60 * i);
            hexagon.push({
                x: size + size * Math.cos(angle),
                y: size + size * Math.sin(angle)
            });
        }

        graphics.fillPoints(hexagon, true);
        graphics.generateTexture(key, size * 2, size * 2);
        graphics.destroy();
    }
}

export function createEnemyTexture(scene: Phaser.Scene, key: string, color: number, size: number): void {
    if (!scene.textures.exists(key)) {
        const graphics = scene.add.graphics();
        graphics.fillStyle(color, 1);
        graphics.fillRect(0, 0, size * 2, size * 2);
        graphics.generateTexture(key, size * 2, size * 2);
        graphics.destroy();
    }
}