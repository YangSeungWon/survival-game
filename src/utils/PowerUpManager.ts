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
import { PlayerAttackStats } from './PlayerAttackStats';

export interface PowerUp {
    name: string;
    color: number;
    description: string;
    apply: (scene: GameScene, player: Player) => void;
}

export default class PowerUpManager {
    private scene: GameScene;
    private player: Player;
    private keyboardListeners: ((event: KeyboardEvent) => void)[];
    private powerUpBackground?: Phaser.GameObjects.Rectangle;
    private depthManager: DepthManager;
    selectedPowerUps: string[];

    // Centralized list of power-ups
    private static readonly powerUps: PowerUp[] = [
        {
            name: 'Health Boost',
            color: 0xff6136,
            description: 'Increase health restoration by 500.',
            apply: (scene: GameScene, player: Player) => { player.heartRestore += 500; }
        },
        {
            name: 'Move Speed',
            color: 0x91ffe4,
            description: 'Increase movement speed by 50.',
            apply: (scene: GameScene, player: Player) => { player.moveSpeed += 50; }
        },
        {
            name: 'Life Steal',
            color: 0xcc569f,
            description: 'Gain 5% of damage dealt as health.',
            apply: (scene: GameScene, player: Player) => { player.percentLifeSteal += 5; }
        },
        {
            name: 'Defense Boost',
            color: 0xb1fa75,
            description: 'Increase defense by 100.',
            apply: (scene: GameScene, player: Player) => { player.defense += 100; }
        },
        {
            name: 'Critical Hit Chance',
            color: 0xbea6ff,
            description: 'Increase critical hit chance by 20%.',
            apply: (scene: GameScene, player: Player) => { player.percentCritChance += 20; }
        },
        {
            name: 'Piercing Projectile',
            color: 0xa6ffbc,
            description: 'Add a piercing projectile.',
            apply: (scene: GameScene, player: Player) => { applyProjectilePowerUp(scene, player); }
        },
        {
            name: 'Melee Attack',
            color: 0xff87e5,
            description: 'Add a melee attack.',
            apply: (scene: GameScene, player: Player) => { applyMeleePowerUp(scene, player); }
        },
        {
            name: 'Burning AoE',
            color: 0xfcb16a,
            description: 'Add a burning circle.',
            apply: (scene: GameScene, player: Player) => { applyAreaOfEffectBurningPowerUp(scene, player); }
        },
        {
            name: 'Freezing AoE',
            color: 0xa7f1f2,
            description: 'Add a freezing circle.',
            apply: (scene: GameScene, player: Player) => { applyAreaOfEffectFreezingPowerUp(scene, player); }
        },
        {
            name: 'Poisoning AoE',
            color: 0x67a865,
            description: 'Add a poisoning circle.',
            apply: (scene: GameScene, player: Player) => { applyAreaOfEffectPoisoningPowerUp(scene, player); }
        },
        {
            name: 'Stunning Projectile',
            color: 0xf6fa89,
            description: 'Add a stunning projectile.',
            apply: (scene: GameScene, player: Player) => { applyProjectileStunPowerUp(scene, player); }
        },
        {
            name: 'One shot Projectile',
            color: 0xa9b5c9,
            description: 'Add a one shot projectile.',
            apply: (scene: GameScene, player: Player) => { applyOneShotProjectilePowerUp(scene, player); }
        },
        {
            name: 'Farthest Beam Attack',
            color: 0x00ffff,
            description: 'Shoot a beam at the farthest enemy within range.',
            apply: (scene: GameScene, player: Player) => { applyBeamPowerUp(scene, player); }
        }
    ];

    constructor(scene: GameScene, player: Player) {
        this.scene = scene;
        this.player = player;
        this.keyboardListeners = [];
        this.depthManager = DepthManager.getInstance();
        this.selectedPowerUps = [];
    }

    // Getter to expose the list of power-ups
    public static getPowerUps(): PowerUp[] {
        return this.powerUps;
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

        const allPowerUps: PowerUp[] = [...PowerUpManager.powerUps];
        
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
                powerUp.apply(this.scene, this.player);
                this.selectedPowerUps.push(powerUp.name);
                this.closePowerUpSelection();
            });

            const listener = (event: KeyboardEvent) => {
                if (event.key === `${index + 1}`) {
                    powerUp.apply(this.scene, this.player);
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

}



// Example implementations of apply methods
function applyProjectilePowerUp(scene: GameScene, player: Player): void {
    const attackStat = PlayerAttackStats.find(stat => stat.name === 'Piercing Projectile')!;
    const projectileAttackConfig: ProjectileAttackConfig & AttackConfig = {
        attackSpeed: attackStat.attackSpeed!,
        projectileSpeed: attackStat.projectileSpeed!,
        attackPower: attackStat.attackPower,
        attackRange: attackStat.attackRange,
        attackColor: attackStat.color,
        projectileSize: attackStat.projectileSize!,
        piercingCount: attackStat.piercingCount!
    };
    const newProjectileAttack = new ProjectileAttack(scene, player, projectileAttackConfig);
    player.addAttack(newProjectileAttack);
}

function applyMeleePowerUp(scene: GameScene, player: Player): void {
    const attackStat = PlayerAttackStats.find(stat => stat.name === 'Melee Attack')!;
    const meleeAttackConfig: MeleeAttackConfig & AttackConfig = {
        attackSpeed: attackStat.attackSpeed!,
        attackPower: attackStat.attackPower!,
        attackRange: attackStat.attackRange!,
        attackAngle: attackStat.attackAngle!,
        attackColor: attackStat.color
    };
    const newMeleeAttack = new MeleeAttack(scene, player, meleeAttackConfig);
    player.addAttack(newMeleeAttack);
}

function applyAreaOfEffectBurningPowerUp(scene: GameScene, player: Player): void {
    const attackStat = PlayerAttackStats.find(stat => stat.name === 'Burning AoE')!;
    const areaOfEffectAttackConfig: AreaOfEffectAttackConfig = {
        attackSpeed: attackStat.attackSpeed!,
        attackPower: 0,
        attackRange: attackStat.attackRange!,
        effectRange: attackStat.effectRange!,
        statusEffect: {
            type: StatusEffectType.BURN,
            id: 'burningAoE' + Date.now(),
            duration: attackStat.effectDuration!,
            tickRate: attackStat.effectTickRate!
        },
        attackColor: attackStat.color
    }
    const newAreaOfEffectAttack = new AreaOfEffectAttack(scene, player, areaOfEffectAttackConfig);
    player.addAttack(newAreaOfEffectAttack);
}

function applyAreaOfEffectFreezingPowerUp(scene: GameScene, player: Player): void {
    const attackStat = PlayerAttackStats.find(stat => stat.name === 'Freezing AoE')!;
    const areaOfEffectAttackConfig: AreaOfEffectAttackConfig = {
        attackSpeed: attackStat.attackSpeed!,
        attackPower: attackStat.attackPower!,
        attackRange: attackStat.attackRange!,
        effectRange: attackStat.effectRange!,
        statusEffect: {
            type: StatusEffectType.FREEZE,
            duration: attackStat.effectDuration!,
            id: 'freezingAoE' + Date.now(),
        },
        attackColor: attackStat.color
    }
    const newAreaOfEffectAttack = new AreaOfEffectAttack(scene, player, areaOfEffectAttackConfig);
    player.addAttack(newAreaOfEffectAttack);
}

function applyAreaOfEffectPoisoningPowerUp(scene: GameScene, player: Player): void {
    const attackStat = PlayerAttackStats.find(stat => stat.name === 'Poisoning AoE')!;
    const areaOfEffectAttackConfig: AreaOfEffectAttackConfig = {
        attackSpeed: attackStat.attackSpeed!,
        attackPower: attackStat.attackPower!,
        attackRange: attackStat.attackRange!,
        effectRange: attackStat.effectRange!,
        statusEffect: {
            type: StatusEffectType.POISON,
            duration: attackStat.effectDuration!,
            tickRate: attackStat.effectTickRate!,
            id: 'poisoningAoE' + Date.now(),
        },
        attackColor: attackStat.color
    }
    const newAreaOfEffectAttack = new AreaOfEffectAttack(scene, player, areaOfEffectAttackConfig);
    player.addAttack(newAreaOfEffectAttack);
}

function applyProjectileStunPowerUp(scene: GameScene, player: Player): void {
    const attackStat = PlayerAttackStats.find(stat => stat.name === 'Stunning Projectile')!;
    const projectileAttackConfig: ProjectileAttackConfig = {
        attackSpeed: attackStat.attackSpeed!,
        projectileSpeed: attackStat.projectileSpeed!,
        attackPower: attackStat.attackPower!,
        attackRange: attackStat.attackRange!,
        attackColor: attackStat.color,
        projectileSize: attackStat.projectileSize!,
        piercingCount: 0,
        statusEffect: {
            type: StatusEffectType.STUN,
            duration: attackStat.effectDuration!,
            id: 'stunProjectile' + Date.now(),
        }
    }   
    const newProjectileAttack = new ProjectileAttack(scene, player, projectileAttackConfig);
    player.addAttack(newProjectileAttack);
}

function applyOneShotProjectilePowerUp(scene: GameScene, player: Player): void {
    const attackStat = PlayerAttackStats.find(stat => stat.name === 'One Shot Projectile')!;
    const projectileAttackConfig: ProjectileAttackConfig & AttackConfig = {
        attackSpeed: attackStat.attackSpeed!,
        projectileSpeed: attackStat.projectileSpeed!,
        attackPower: attackStat.attackPower!,
        attackRange: attackStat.attackRange!,
        attackColor: attackStat.color,
        projectileSize: attackStat.projectileSize!,
        piercingCount: attackStat.piercingCount!,
    };
    const newProjectileAttack = new ProjectileAttack(scene, player, projectileAttackConfig);
    player.addAttack(newProjectileAttack);
}

function applyBeamPowerUp(scene: GameScene, player: Player): void {
    const attackStat = PlayerAttackStats.find(stat => stat.name === 'Farthest Beam Attack')!;
    const beamAttackConfig: BeamAttackConfig = {
        attackRange: attackStat.attackRange!,
        attackSpeed: attackStat.attackSpeed!,
        attackPower: attackStat.attackPower!,
        attackColor: attackStat.color,
        beamDuration: attackStat.beamDuration!,
        beamWidth: attackStat.beamWidth!
    };
    const newBeamAttack = new BeamAttack(scene, player, beamAttackConfig);
    player.addAttack(newBeamAttack);
}
