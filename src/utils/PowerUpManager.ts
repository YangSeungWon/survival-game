import Phaser from 'phaser';
import ProjectileAttack from '../attacks/ProjectileAttack';
import MeleeAttack from '../attacks/MeleeAttack';
import Player from '../sprites/Player';
import GameScene from '../scenes/GameScene';
import { AttackConfig, StatusEffectType } from '../attacks/Attack';
import AreaOfEffectAttack from '../attacks/AreaOfEffectAttack';
import { ProjectileAttackConfig } from '../attacks/ProjectileAttack';
import { MeleeAttackConfig } from '../attacks/MeleeAttack';
import { AreaOfEffectAttackConfig } from '../attacks/AreaOfEffectAttack';
import DepthManager, { DepthLayer } from './DepthManager';
import BeamAttack, { BeamAttackConfig } from '../attacks/BeamAttack';

interface PowerUp {
    name: string;
    color: number;
    description: string;
    apply: () => void;
}

export default class PowerUpManager {
    private scene: GameScene;
    private player: Player;
    private keyboardListeners: ((event: KeyboardEvent) => void)[];
    private powerUpBackground?: Phaser.GameObjects.Rectangle;
    private depthManager: DepthManager;
    selectedPowerUps: string[];
    constructor(scene: GameScene, player: Player) {
        this.scene = scene;
        this.player = player;
        this.keyboardListeners = [];
        this.depthManager = DepthManager.getInstance();
        this.selectedPowerUps = [];
    }

    showPowerUpSelection(level: number): void {
        const centerX = this.scene.cameras.main.worldView.x + this.scene.cameras.main.width / 2;
        const centerY = this.scene.cameras.main.worldView.y + this.scene.cameras.main.height / 2;

        this.powerUpBackground = this.scene.add.rectangle(centerX, centerY, 400, 350, 0xffffff, 1.0)
            .setOrigin(0.5)
            .setDepth(this.depthManager.getDepth(DepthLayer.UI));

        const title = this.scene.add.text(
            centerX, 
            centerY - 160, 
            `Level ${level}! Choose a Power-Up:`, 
            { fontSize: '24px', color: '#000000' }
        ).setOrigin(0.5)
          .setDepth(this.depthManager.getDepth(DepthLayer.UI));
        title.setData('powerUp', true);

        const allPowerUps: PowerUp[] = [
            { name: 'Health Boost', color: 0xff6136, description: 'Increase health restoration by 500.', apply: () => { this.player.heartRestore += 500 } },
            { name: 'Move Speed', color: 0x91ffe4, description: 'Increase movement speed by 50.', apply: () => { this.player.moveSpeed += 50 } },
            { name: 'Life Steal', color: 0xcc569f, description: 'Gain 5% of damage dealt as health.', apply: () => { this.player.percentLifeSteal += 5 } },
            { name: 'Defense Boost', color: 0xb1fa75, description: 'Increase defense by 100.', apply: () => { this.player.defense += 100 } },
            { name: 'Critical Hit Chance', color: 0xbea6ff, description: 'Increase critical hit chance by 20%.', apply: () => { this.player.percentCritChance += 20 } },
            { name: 'Piercing Projectile', color: 0xa6ffbc, description: 'Add a piercing projectile.', apply: () => { this.applyProjectilePowerUp() } },
            { name: 'Melee Attack', color: 0xff87e5, description: 'Add a melee attack.', apply: () => { this.applyMeleePowerUp() } },
            { name: 'Burning AoE', color: 0xfcb16a, description: 'Add a burning circle.', apply: () => { this.applyAreaOfEffectBurningPowerUp() } },
            { name: 'Freezing AoE', color: 0xa7f1f2, description: 'Add a freezing circle.', apply: () => { this.applyAreaOfEffectFreezingPowerUp() } },
            { name: 'Poisoning AoE', color: 0x67a865, description: 'Add a poisoning circle.', apply: () => { this.applyAreaOfEffectPoisoningPowerUp() } },
            { name: 'Stun Projectile', color: 0xf6fa89, description: 'Add a stun projectile.', apply: () => { this.applyProjectileStunPowerUp() } },
            { name: 'One-shot Projectile', color: 0xa9b5c9, description: 'Add a one-shot projectile.', apply: () => { this.applyOneShotProjectilePowerUp() } },
            { name: 'Farthest Beam Attack', color: 0x00ffff, description: 'Shoot a beam at the farthest enemy within range.', apply: () => { this.applyBeamPowerUp() } }
        ];

        Phaser.Utils.Array.Shuffle(allPowerUps);
        const selectedPowerUps = allPowerUps.slice(0, 3);

        selectedPowerUps.forEach((powerUp, index) => {
            const buttonY = centerY - 80 + index * 100;

            const button = this.scene.add.rectangle(
                centerX, 
                buttonY, 
                300, 
                80, 
                powerUp.color
            ).setInteractive()
              .setDepth(this.depthManager.getDepth(DepthLayer.UI));
            button.setStrokeStyle(2, 0x000000);
            button.setData('powerUp', true);

            const buttonText = this.scene.add.text(
                centerX, 
                buttonY - 20, 
                `${index + 1}: ${powerUp.name}`, 
                { fontSize: '20px', color: '#000000' }
            ).setOrigin(0.5)
              .setDepth(this.depthManager.getDepth(DepthLayer.UI) + 1);
            buttonText.setData('powerUp', true);

            const descriptionText = this.scene.add.text(
                centerX,
                buttonY + 15,
                powerUp.description,
                { 
                    fontSize: '16px', 
                    color: '#000000', 
                    wordWrap: { width: 280 } 
                }
            ).setOrigin(0.5)
              .setDepth(this.depthManager.getDepth(DepthLayer.UI) + 1);
            descriptionText.setData('powerUp', true);

            button.on('pointerdown', () => {
                powerUp.apply();
                this.selectedPowerUps.push(powerUp.name);
                this.closePowerUpSelection();
            });

            const listener = (event: KeyboardEvent) => {
                if (event.key === `${index + 1}`) {
                    powerUp.apply();
                    this.selectedPowerUps.push(powerUp.name);
                    this.closePowerUpSelection();
                }
            };
            if (this.scene.input.keyboard) {
                this.scene.input.keyboard.on('keydown', listener);
                this.keyboardListeners.push(listener);
            }
        });

        const cancelY = centerY + 200;
        const cancelButton = this.scene.add.rectangle(
            centerX, 
            cancelY, 
            100, 
            40, 
            0xff4444
        ).setInteractive()
          .setDepth(this.depthManager.getDepth(DepthLayer.UI));
        cancelButton.setData('powerUp', true);

        const cancelText = this.scene.add.text(
            centerX, 
            cancelY, 
            'Cancel', 
            { fontSize: '18px', color: '#ffffff' }
        ).setOrigin(0.5)
          .setDepth(this.depthManager.getDepth(DepthLayer.UI) + 1);
        cancelText.setData('powerUp', true);

        cancelButton.on('pointerdown', () => {
            this.closePowerUpSelection();
        });
    }

    private closePowerUpSelection(): void {
        if (this.powerUpBackground) {
            this.powerUpBackground.destroy();
        }

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
        (this.scene as GameScene).isPausedInGame = false;
    }

    private applyProjectilePowerUp(): void {
        const projectileAttackConfig: ProjectileAttackConfig & AttackConfig = {
            attackSpeed: 300,
            projectileSpeed: 300,
            attackPower: 10,
            attackRange: 2000,
            attackColor: 0xa6ffbc,
            projectileSize: 10,
            piercingCount: 30
        };
        const newProjectileAttack = new ProjectileAttack(this.scene, this.player, projectileAttackConfig);
        this.player.addAttack(newProjectileAttack);
    }

    private applyMeleePowerUp(): void {
        const meleeAttackConfig: MeleeAttackConfig & AttackConfig = {
            attackSpeed: 1000,
            attackPower: 1000,
            attackRange: 100,
            attackAngle: 90,
            attackColor: 0xff87e5
        };
        const newMeleeAttack = new MeleeAttack(this.scene, this.player, meleeAttackConfig);
        this.player.addAttack(newMeleeAttack);
    }

    private applyAreaOfEffectBurningPowerUp(): void {
        const areaOfEffectAttackConfig: AreaOfEffectAttackConfig = {
            attackSpeed: 100,
            attackPower: 0,
            attackRange: 130,
            effectRange: 130,
            statusEffect: {
                type: 'burn' as StatusEffectType,
                id: 'burningAoE' + Date.now(),
                duration: 500,
                tickRate: 200
            },
            attackColor: 0xff0000
        }
        const newAreaOfEffectAttack = new AreaOfEffectAttack(this.scene, this.player, areaOfEffectAttackConfig);
        this.player.addAttack(newAreaOfEffectAttack);
    }

    private applyAreaOfEffectFreezingPowerUp(): void {
        const areaOfEffectAttackConfig: AreaOfEffectAttackConfig = {
            attackSpeed: 100,
            attackPower: 0,
            attackRange: 200,
            effectRange: 200,
            statusEffect: {
                type: 'freeze' as StatusEffectType,
                duration: 100,
                id: 'freezingAoE' + Date.now(),
            },
            attackColor: 0x0000ff
        }
        const newAreaOfEffectAttack = new AreaOfEffectAttack(this.scene, this.player, areaOfEffectAttackConfig);
        this.player.addAttack(newAreaOfEffectAttack);
    }

    private applyAreaOfEffectPoisoningPowerUp(): void {
        const areaOfEffectAttackConfig: AreaOfEffectAttackConfig = {
            attackSpeed: 100,
            attackPower: 0,
            attackRange: 130,
            effectRange: 130,
            statusEffect: {
                type: 'poison' as StatusEffectType,
                duration: 500,
                tickRate: 200,
                id: 'poisoningAoE' + Date.now(),
            },
            attackColor: 0x00ff00
        }
        const newAreaOfEffectAttack = new AreaOfEffectAttack(this.scene, this.player, areaOfEffectAttackConfig);
        this.player.addAttack(newAreaOfEffectAttack);
    }

    private applyProjectileStunPowerUp(): void {
        const projectileAttackConfig: ProjectileAttackConfig = {
            attackSpeed: 200,
            projectileSpeed: 700,
            attackPower: 5,
            attackRange: 200,
            attackColor: 0xffff00,
            projectileSize: 7,
            piercingCount: 0,
            statusEffect: {
                type: 'stun' as StatusEffectType,
                duration: 500,
                id: 'stunProjectile' + Date.now(),
            }
        }   
        const newProjectileAttack = new ProjectileAttack(this.scene, this.player, projectileAttackConfig);
        this.player.addAttack(newProjectileAttack);
    }

    private applyOneShotProjectilePowerUp(): void {
        const projectileAttackConfig: ProjectileAttackConfig & AttackConfig = {
            attackSpeed: 500,
            projectileSpeed: 300,
            attackPower: 1000,
            attackRange: 150,
            attackColor: 0xa9b5c9,
            projectileSize: 10,
            piercingCount: 0,
        };
        const newProjectileAttack = new ProjectileAttack(this.scene, this.player, projectileAttackConfig);
        this.player.addAttack(newProjectileAttack);
    }

    private applyBeamPowerUp(): void {
        const beamAttackConfig: BeamAttackConfig = {
            attackRange: 400,
            attackSpeed: 2000,
            attackPower: 20,
            attackColor: 0x00ffff,
            beamDuration: 500,
            beamWidth: 7
        };
        const newBeamAttack = new BeamAttack(this.scene, this.player, beamAttackConfig);
        this.player.addAttack(newBeamAttack);
    }
}
