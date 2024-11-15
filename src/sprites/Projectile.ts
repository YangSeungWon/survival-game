import Phaser from 'phaser';
import { createProjectileTexture } from '../utils/TextureGenerator';
import { moveObject } from '../utils/MovementUtils';
import GameScene from '../scenes/GameScene';
import Character from './Character';
import Player from './Player';
import Enemy from './enemies/Enemy';
import { StatusEffect } from '../attacks/Attack';
import DepthManager, { DepthLayer } from '../utils/DepthManager';

export default class Projectile extends Phaser.Physics.Arcade.Sprite {
    scene: GameScene;
    facingAngle: number;
    speed: number;
    speedModifier: number = 1;
    attackPower: number;
    owner: Character;
    piercingCount: number = 0;
    hitTargets: Set<Phaser.GameObjects.GameObject> = new Set();
    statusEffect: StatusEffect | null = null;
    attackRange: number = 0; // New property for maximum attack range
    statusEffects: Map<string, StatusEffect> = new Map();
    private startX: number = 0; // Starting X position
    private startY: number = 0; // Starting Y position

    constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, 'projectileTexture');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setActive(false);
        this.setVisible(false);
        this.facingAngle = 0;
        this.speed = 0;
        this.speedModifier = 1;
        this.attackPower = 0;
        this.owner = {} as Character;
        this.scene = scene;
        this.hitTargets = new Set();
        this.setDepth(DepthManager.getInstance().getDepth(DepthLayer.PROJECTILE));

        this.setCollideWorldBounds(true);
        scene.physics.world.on('worldbounds', this.handleWorldBounds, this);

        this.visible = false;
        this.active = false;
    }

    fire(
        owner: Character,
        angle: number,
        speed: number,
        attackPower: number,
        color: number,
        projectileSize: number,
        piercingCount: number,
        statusEffect: StatusEffect | null,
        attackRange: number // New parameter for attack range
    ): void {
        const textureKey = this.getTextureKey(projectileSize, color);
        if (!this.scene.textures.exists(textureKey)) {
            createProjectileTexture(this.scene, textureKey, color, projectileSize);
        }
        this.setTexture(textureKey);

        this.setPosition(owner.x, owner.y);
        this.startX = owner.x; // Store starting X
        this.startY = owner.y; // Store starting Y
        this.setActive(true);
        this.setVisible(true);

        this.facingAngle = angle;
        this.speed = speed;
        this.speedModifier = 1;
        this.attackPower = attackPower;
        this.attackRange = attackRange; // Set attack range

        this.owner = owner;
        this.statusEffects.clear();

        this.setTint(color);

        this.piercingCount = piercingCount;
        this.hitTargets.clear();
        
        this.statusEffect = statusEffect;

        const handleCollision = this.handleCollision as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback;
        if (owner instanceof Player) {
            this.scene.physics.add.overlap(this, this.scene.enemies!, handleCollision, null as any, this);
        } else if (owner instanceof Enemy) {
            this.scene.physics.add.overlap(this, this.scene.player!, handleCollision, null as any, this);
        } else {
            alert('Projectile: Invalid target');
        }

        this.visible = true;
        this.active = true;
    }

    getTextureKey(projectileSize: number, color: number): string {
        return `projectileTexture_${projectileSize}_${color}`;
    }

    handleCollision(
        projectile: Phaser.Types.Physics.Arcade.GameObjectWithBody,
        target: Phaser.Types.Physics.Arcade.GameObjectWithBody
    ): void {
        const projectileSprite = projectile as Projectile;
        const targetEntity = target as Character;

        if (projectileSprite.active && projectileSprite.visible) {
            if (
                (projectileSprite.owner instanceof Player && targetEntity instanceof Enemy) ||
                (projectileSprite.owner instanceof Enemy && targetEntity instanceof Player)
            ) {
                if (!projectileSprite.hitTargets.has(targetEntity)) {
                    targetEntity.takeDamage(projectileSprite.attackPower);
                    projectileSprite.hitTargets.add(targetEntity);

                    if (projectileSprite.statusEffect) {
                        targetEntity.applyStatusEffect(projectileSprite.statusEffect);
                    }

                    if (projectileSprite.piercingCount <= 0) {
                        projectileSprite.setActive(false);
                        projectileSprite.setVisible(false);
                    }

                    projectileSprite.piercingCount--;
                }
            }
        }
    }

    move(deltaMultiplier: number): void {
        moveObject(this, this.facingAngle, this.speed * this.speedModifier, deltaMultiplier);
        this.checkBounds();
        this.checkAttackRange(); // Check if attack range exceeded
    }

    private checkBounds(): void {
        const { x, y } = this;

        if (x < 0 || x > this.scene.mapSize || y < 0 || y > this.scene.mapSize) {
            this.setActive(false);
            this.setVisible(false);
            if (this.body) {
                this.body.stop(); // Stop movement
            }
        }
    }

    private checkAttackRange(): void {
        const distance = Phaser.Math.Distance.Between(this.startX, this.startY, this.x, this.y);
        if (distance > this.attackRange) {
            this.setActive(false);
            this.setVisible(false);
            if (this.body) {
                this.body.stop();
            }
        }
    }

    private handleWorldBounds(body: Phaser.Physics.Arcade.Body, up: boolean, down: boolean, left: boolean, right: boolean): void {
        if (body.gameObject === this) {
            this.setActive(false);
            this.setVisible(false);
            if (this.body) {
                this.body.stop();
            }
        }
    }

    applyStatusEffect(effect: StatusEffect): void {
        if (!this.scene) return;

        const existingEffect = this.statusEffects.get(effect.id);

        if (existingEffect) {
            // Update duration if the IDs match exactly
            existingEffect.duration = effect.duration;
            // Optionally, reset other properties if needed
            existingEffect.tickRate = effect.tickRate;
            // You can update other properties as required
            return;
        }

        this.enterStatusEffect(effect);
        const copiedEffect = {
            ...effect,
            lastTick: 0,
        };
        this.statusEffects.set(effect.id, copiedEffect);
    }


    enterStatusEffect(effect: StatusEffect): void {
        switch (effect.type) {
            case 'freeze':
                this.speedModifier *= 0.7;
                break;
        }
    }

    applyEffectLogic(effect: StatusEffect, tickRate: number): void {
        return;
    }

    exitStatusEffect(effect: StatusEffect): void {
        switch (effect.type) {
            case 'freeze':
                this.speedModifier /= 0.7;
                break;
        }
    }

    updateStatusEffects(delta: number): void {
        this.statusEffects.forEach((effect, id) => {
            effect.duration -= delta;
            if (!effect.lastTick) effect.lastTick = 0;
            effect.lastTick += delta; // Update the last tick time

            // Apply effect logic only if tickRate is defined and enough time has passed
            if (effect.tickRate && effect.lastTick >= effect.tickRate) {
                this.applyEffectLogic(effect, effect.tickRate);
                effect.lastTick = 0; // Reset the last tick
            }

            if (effect.duration <= 0) {
                this.exitStatusEffect(effect);
                this.statusEffects.delete(id);
            }
        });
    }

}
