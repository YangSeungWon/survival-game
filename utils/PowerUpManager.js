import Phaser from 'phaser';
import ProjectileAttack from '../attacks/ProjectileAttack';
import MeleeAttack from '../attacks/MeleeAttack';
export default class PowerUpManager {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        this.keyboardListeners = [];
        const centerX = this.scene.cameras.main.worldView.x + this.scene.cameras.main.width / 2;
        const centerY = this.scene.cameras.main.worldView.y + this.scene.cameras.main.height / 2;
        this.powerUpBackground = this.scene.add.rectangle(centerX, centerY, 400, 350, 0x000000, 0.7)
            .setVisible(false);
    }
    showPowerUpSelection(level) {
        this.powerUpBackground.setVisible(true);
        const centerX = this.scene.cameras.main.worldView.x + this.scene.cameras.main.width / 2;
        const centerY = this.scene.cameras.main.worldView.y + this.scene.cameras.main.height / 2;
        this.scene.add.text(centerX, centerY - 160, `Level ${level}! Choose a Power-Up:`, { fontSize: '24px', color: '#ffffff' }).setOrigin(0.5);
        const allPowerUps = [
            { name: 'Health Boost', description: 'Increase maximum health by 200.', apply: () => { this.player.maxHealth += 200; this.player.health += 200; } },
            { name: 'Speed Boost', description: 'Increase movement speed by 40.', apply: () => { this.player.speed += 40; } },
            { name: 'Life Steal', description: 'Gain health equal to 10% of damage dealt.', apply: () => { this.player.lifeSteal += 0.1; } },
            { name: 'Defense Boost', description: 'Increase defense by 10.', apply: () => { this.player.defense += 1; } },
            { name: 'Critical Hit Chance', description: 'Increase critical hit chance by 5%.', apply: () => { this.player.critChance += 0.05; } },
            { name: 'Projectile Attack', description: 'Add a projectile attack.', apply: () => { this.applyProjectilePowerUp(); } },
            { name: 'Melee Attack', description: 'Add a melee attack.', apply: () => { this.applyMeleePowerUp(); } }
        ];
        Phaser.Utils.Array.Shuffle(allPowerUps);
        const selectedPowerUps = allPowerUps.slice(0, 3);
        selectedPowerUps.forEach((powerUp, index) => {
            const buttonY = centerY - 80 + index * 80;
            const button = this.scene.add.rectangle(centerX, buttonY, 200, 50, 0x555555).setInteractive();
            this.scene.add.text(centerX, buttonY, `${index + 1}: ${powerUp.name}`, { fontSize: '20px', color: '#ffffff' }).setOrigin(0.5);
            button.on('pointerdown', () => {
                powerUp.apply();
                this.closePowerUpSelection();
            });
            const listener = (event) => {
                if (event.key === `${index + 1}`) {
                    powerUp.apply();
                    this.closePowerUpSelection();
                }
            };
            if (this.scene.input.keyboard) {
                this.scene.input.keyboard.on('keydown', listener);
                this.keyboardListeners.push(listener);
            }
        });
        const cancelY = centerY + 140;
        const cancelButton = this.scene.add.rectangle(centerX, cancelY, 100, 40, 0xff4444).setInteractive();
        this.scene.add.text(centerX, cancelY, 'Cancel', { fontSize: '18px', color: '#ffffff' }).setOrigin(0.5);
        cancelButton.on('pointerdown', () => {
            this.closePowerUpSelection();
        });
    }
    closePowerUpSelection() {
        this.powerUpBackground.setVisible(false);
        this.scene.children.getAll().forEach(child => {
            const gameObject = child;
            gameObject.destroy();
        });
        if (this.scene.input.keyboard) {
            this.keyboardListeners.forEach(listener => {
                this.scene.input.keyboard.off('keydown', listener);
            });
        }
        this.scene.resumeGame();
    }
    applyProjectilePowerUp() {
        const projectileAttackConfig = {
            attackSpeed: 1000,
            projectileSpeed: 300,
            attackPower: 30,
            attackRange: 1000,
            projectileColor: 0x00ff00,
            projectileSize: 8
        };
        const newProjectileAttack = new ProjectileAttack(this.scene, this.player, projectileAttackConfig);
        this.player.addAttack(newProjectileAttack);
    }
    applyMeleePowerUp() {
        const meleeAttackConfig = {
            attackSpeed: 2000,
            attackPower: 50,
            attackRange: 50,
            attackAngle: 60
        };
        const newMeleeAttack = new MeleeAttack(this.scene, this.player, meleeAttackConfig);
        this.player.addAttack(newMeleeAttack);
    }
}
//# sourceMappingURL=PowerUpManager.js.map