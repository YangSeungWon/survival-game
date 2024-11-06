import Phaser from 'phaser';
import ProjectileAttack from '../attacks/ProjectileAttack';
import MeleeAttack from '../attacks/MeleeAttack';
import Player from '../sprites/Player';
import GameScene from '../scenes/GameScene';
import { AttackConfig } from '../attacks/Attack';

interface PowerUp {
    name: string;
    description: string;
    apply: () => void;
}

interface ProjectileAttackConfig {
    attackSpeed: number;
    projectileSpeed: number;
    attackPower: number;
    attackRange: number;
    projectileColor: number;
    projectileSize: number;
}

interface MeleeAttackConfig {
    attackSpeed: number;
    attackPower: number;
    attackRange: number;
    attackAngle: number;
}

export default class PowerUpManager {
    private scene: GameScene;
    private player: Player;
    private keyboardListeners: ((event: KeyboardEvent) => void)[];
    private powerUpBackground: Phaser.GameObjects.Rectangle;

    constructor(scene: GameScene, player: Player) {
        this.scene = scene;
        this.player = player;
        this.keyboardListeners = [];

        const centerX = this.scene.cameras.main.worldView.x + this.scene.cameras.main.width / 2;
        const centerY = this.scene.cameras.main.worldView.y + this.scene.cameras.main.height / 2;
        this.powerUpBackground = this.scene.add.rectangle(centerX, centerY, 400, 350, 0x000000, 0.7)
            .setVisible(false);
    }

    showPowerUpSelection(level: number): void {
        this.powerUpBackground.setVisible(true);

        const centerX = this.scene.cameras.main.worldView.x + this.scene.cameras.main.width / 2;
        const centerY = this.scene.cameras.main.worldView.y + this.scene.cameras.main.height / 2;

        const title = this.scene.add.text(
            centerX, 
            centerY - 160, 
            `Level ${level}! Choose a Power-Up:`, 
            { fontSize: '24px', color: '#ffffff' }
        ).setOrigin(0.5);
        title.setData('powerUp', true);

        const allPowerUps: PowerUp[] = [
            { name: 'Health Boost', description: 'Increase maximum health by 500.', apply: () => { this.player.maxHealth += 500; this.player.health += 500 } },
            { name: 'Speed Boost', description: 'Increase movement speed by 40.', apply: () => { this.player.speed += 40 } },
            { name: 'Life Steal', description: 'Gain health equal to 10% of damage dealt.', apply: () => { this.player.lifeSteal += 0.1 } },
            { name: 'Defense Boost', description: 'Increase defense by 10.', apply: () => { this.player.defense += 10 } },
            { name: 'Critical Hit Chance', description: 'Increase critical hit chance by 10%.', apply: () => { this.player.critChance += 0.1 } },
            { name: 'Projectile Attack', description: 'Add a projectile attack.', apply: () => { this.applyProjectilePowerUp() } },
            { name: 'Melee Attack', description: 'Add a melee attack.', apply: () => { this.applyMeleePowerUp() } }
        ];

        Phaser.Utils.Array.Shuffle(allPowerUps);
        const selectedPowerUps = allPowerUps.slice(0, 3);

        selectedPowerUps.forEach((powerUp, index) => {
            const buttonY = centerY - 80 + index * 80;

            const button = this.scene.add.rectangle(
                centerX, 
                buttonY, 
                200, 
                50, 
                0x555555
            ).setInteractive();
            button.setData('powerUp', true);

            const buttonText = this.scene.add.text(
                centerX, 
                buttonY, 
                `${index + 1}: ${powerUp.name}`, 
                { fontSize: '20px', color: '#ffffff' }
            ).setOrigin(0.5);
            buttonText.setData('powerUp', true);

            button.on('pointerdown', () => {
                powerUp.apply();
                this.closePowerUpSelection();
            });

            const listener = (event: KeyboardEvent) => {
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
        const cancelButton = this.scene.add.rectangle(
            centerX, 
            cancelY, 
            100, 
            40, 
            0xff4444
        ).setInteractive();
        cancelButton.setData('powerUp', true);

        const cancelText = this.scene.add.text(
            centerX, 
            cancelY, 
            'Cancel', 
            { fontSize: '18px', color: '#ffffff' }
        ).setOrigin(0.5);
        cancelText.setData('powerUp', true);

        cancelButton.on('pointerdown', () => {
            this.closePowerUpSelection();
        });
    }

    private closePowerUpSelection(): void {
        this.powerUpBackground.setVisible(false);

        this.scene.children.getAll().forEach(child => {
            if (child.getData('powerUp')) {
                child.destroy();
            }
        });

        if (this.scene.input.keyboard) {
            this.keyboardListeners.forEach(listener => {
                this.scene.input.keyboard!.off('keydown', listener);
            });
        }

        (this.scene as GameScene).resumeGame();
    }

    private applyProjectilePowerUp(): void {
        const projectileAttackConfig: ProjectileAttackConfig & AttackConfig = {
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

    private applyMeleePowerUp(): void {
        const meleeAttackConfig: MeleeAttackConfig & AttackConfig = {
            attackSpeed: 2000,
            attackPower: 50,
            attackRange: 150,
            attackAngle: 60
        };
        const newMeleeAttack = new MeleeAttack(this.scene, this.player, meleeAttackConfig);
        this.player.addAttack(newMeleeAttack);
    }
}
