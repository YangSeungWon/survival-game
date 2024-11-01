export default class PowerUpManager {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        this.keyboardListeners = [];
    }

    showPowerUpSelection(level) {
        const centerX = this.scene.cameras.main.worldView.x + this.scene.cameras.main.width / 2;
        const centerY = this.scene.cameras.main.worldView.y + this.scene.cameras.main.height / 2;

        this.powerUpBackground = this.scene.add.rectangle(
            centerX, 
            centerY, 
            400, 
            350, 
            0x000000, 
            0.7
        ).setDepth(10);

        this.scene.add.text(
            centerX, 
            centerY - 160, 
            `Level ${level}! Choose a Power-Up:`, 
            { fontSize: '24px', fill: '#ffffff' }
        ).setOrigin(0.5).setDepth(11);

        const allPowerUps = [
            { name: 'Health Boost', description: 'Increase maximum health by 200.', apply: () => this.player.maxHealth += 200 },
            { name: 'Speed Boost', description: 'Increase movement speed by 40.', apply: () => this.player.speed += 40 },
            { name: 'Attack Power Boost', description: 'Increase attack power by 5.', apply: () => this.player.attackPower += 5 },
            { name: 'Life Steal', description: 'Gain health equal to 10% of damage dealt.', apply: () => this.player.lifeSteal += 0.1 },
            { name: 'Defense Boost', description: 'Increase defense by 10.', apply: () => this.player.defense += 1 },
            { name: 'Critical Hit Chance', description: 'Increase critical hit chance by 5%.', apply: () => this.player.critChance += 0.05 }
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
            ).setInteractive().setDepth(11);

            this.scene.add.text(
                centerX, 
                buttonY, 
                `${index + 1}: ${powerUp.name}`, 
                { fontSize: '20px', fill: '#ffffff' }
            ).setOrigin(0.5).setDepth(11);

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
            this.scene.input.keyboard.on('keydown', listener);
            this.keyboardListeners.push(listener);
        });

        const cancelY = centerY + 140;
        const cancelButton = this.scene.add.rectangle(
            centerX, 
            cancelY, 
            100, 
            40, 
            0xff4444
        ).setInteractive().setDepth(11);
        this.scene.add.text(
            centerX, 
            cancelY, 
            'Cancel', 
            { fontSize: '18px', fill: '#ffffff' }
        ).setOrigin(0.5).setDepth(11);

        cancelButton.on('pointerdown', () => {
            this.closePowerUpSelection();
        });
    }

    closePowerUpSelection() {
        this.powerUpBackground.destroy();
        this.scene.children.getAll().forEach(child => {
            if (child.depth === 10 || child.depth === 11) {
                child.destroy();
            }
        });

        this.keyboardListeners.forEach(listener => {
            this.scene.input.keyboard.off('keydown', listener);
        });

        this.player.clearTint();
        this.scene.resumeGame();
    }
}
