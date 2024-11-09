import Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload(): void {
        // 필요한 다른 에셋이 있다면 여기에 로드합니다.

        // 동적으로 파티클 텍스처 생성
        const colors: { [key: string]: number } = {
            red: 0xff0000,
            blue: 0x00ffff,
            green: 0x00ff00,
            yellow: 0xffff00
        };

        for (const [key, color] of Object.entries(colors)) {
            const graphics = this.make.graphics({ x: 0, y: 0 });
            graphics.fillStyle(color, 1);
            graphics.fillCircle(8, 8, 8); // 반지름 8의 원을 그림
            graphics.generateTexture(`particle_${key}`, 16, 16);
            graphics.destroy();
        }
    }

    create(): void {
        this.scene.start('GameScene');
    }
}
