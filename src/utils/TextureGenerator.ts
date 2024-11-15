import Phaser from 'phaser';
import { DepthLayer } from './DepthManager';

/**
 * Creates a texture for attack bars.
 */
export function createAttackBarTexture(
    scene: Phaser.Scene,
    key: string,
    color: number,
    length: number,
    height: number = 4
): void {
    if (!scene.textures.exists(key)) {
        const graphics = scene.add.graphics();
        graphics.fillStyle(color, 1);
        graphics.fillRect(0, 0, length, height);
        graphics.generateTexture(key, length, height);
        graphics.destroy();
    }
}

/**
 * Creates a texture for projectiles.
 */
export function createProjectileTexture(
    scene: Phaser.Scene,
    key: string,
    color: number,
    size: number
): void {
    if (!scene.textures.exists(key)) {
        const graphics = scene.add.graphics();
        graphics.fillStyle(color, 1);

        // Calculate the points for a hexagon
        const hexagon = [];
        for (let i = 0; i < 6; i++) {
            const angle = Phaser.Math.DegToRad(60 * i);
            hexagon.push({
                x: size + size * Math.cos(angle),
                y: size + size * Math.sin(angle),
            });
        }

        graphics.fillPoints(hexagon, true);
        graphics.generateTexture(key, size * 2, size * 2);
        graphics.destroy();
    }
}

/**
 * Creates a texture for enemies.
 */
export function createEnemyTexture(
    scene: Phaser.Scene,
    key: string,
    color: number,
    size: number
): void {
    const graphics = scene.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(color, 1);
    graphics.fillCircle(size / 2, size / 2, size / 2);
    graphics.generateTexture(key, size, size);
    graphics.destroy();
}

/**
 * Creates a texture for specific attack types, e.g., beam attacks.
 */
export function createBeamTexture(
    scene: Phaser.Scene,
    key: string,
    color: number,
    width: number,
    height: number
): void {
    if (!scene.textures.exists(key)) {
        const graphics = scene.add.graphics();
        graphics.fillStyle(color, 1);
        graphics.fillRect(0, 0, width, height);
        graphics.generateTexture(key, width, height);
        graphics.destroy();
    }
}

/**
 * Creates a texture for missiles.
 */
export function createMissileTexture(
    scene: Phaser.Scene,
    key: string,
    color: number,
    width: number,
    height: number
): void {
    const graphics = scene.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(color, 1);
    graphics.fillRect(0, 0, width, height);
    graphics.generateTexture(key, width, height);
    graphics.destroy();
}

/**
 * Creates a texture for tracking missiles.
 */
export function createTrackingMissileTexture(
    scene: Phaser.Scene,
    key: string,
    color: number,
    width: number,
    height: number
): void {
    const graphics = scene.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(color, 1);
    graphics.fillTriangle(0, height, width / 2, 0, width, height);
    graphics.generateTexture(key, width, height);
    graphics.destroy();
}