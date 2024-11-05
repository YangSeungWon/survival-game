export function createAttackBarTexture(scene, key, color, length, height = 4) {
    if (!scene.textures.exists(key)) {
        const graphics = scene.add.graphics();
        graphics.fillStyle(color, 1);
        graphics.fillRect(0, 0, length, height);
        graphics.generateTexture(key, length, height);
        graphics.destroy();
    }
}
export function createProjectileTexture(scene, key, color, size) {
    if (!scene.textures.exists(key)) {
        const graphics = scene.add.graphics();
        graphics.fillStyle(color, 1);
        graphics.fillCircle(size, size, size);
        graphics.generateTexture(key, size * 2, size * 2);
        graphics.destroy();
    }
}
export function createEnemyTexture(scene, key, color, size) {
    if (!scene.textures.exists(key)) {
        const graphics = scene.add.graphics();
        graphics.fillStyle(color, 1);
        graphics.fillCircle(size, size, size);
        graphics.generateTexture(key, size * 2, size * 2);
        graphics.destroy();
    }
}
//# sourceMappingURL=TextureGenerator.js.map