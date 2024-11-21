import Phaser from 'phaser';
import Enemy from './Enemy';
import GameScene from '../../scenes/GameScene';
import BeamAttack, { BeamAttackConfig } from '../../attacks/BeamAttack';
import { EnemyConfig } from './Enemy';
import Attack, { AttackConfig } from '../../attacks/Attack';
import EnemyStats, { EnemyStat } from '../../utils/EnemyStats';

export default class BeamShooterEnemy extends Enemy {
    static readonly TYPE = 'BeamShooterEnemy';
    static readonly FROM_LEVEL = 13;
    static readonly TO_LEVEL = 14;

    private beamAttack: BeamAttack;

    constructor(scene: GameScene) {
        const enemyStat: EnemyStat = EnemyStats.find(stat => stat.type === BeamShooterEnemy.TYPE)!;

        const color: number = enemyStat.color;   // 노란색 빔을 시각적으로 표현
        const size: number = enemyStat.size;           // 크기 설정
        const moveSpeed: number = enemyStat.speed;      // 이동 속도
        const health: number = enemyStat.health;        // 체력 설정

        // 공격 속성 정의
        const attackSpeed: number = enemyStat.attackSpeed;  // 빔 발사 속도
        const attackPower: number = enemyStat.attackPower;    // 빔 공격력
        const attackRange: number = enemyStat.attackRange;    // 빔 사거리

        const experiencePoint: number = enemyStat.experiencePoint; // 경험치

        const attackConfig: BeamAttackConfig = {
            attackSpeed: attackSpeed,
            attackPower: attackPower,
            attackRange: attackRange,
            attackColor: color,
            beamDuration: enemyStat.beamDuration!,  // 빔 지속 시간 (밀리초)
            beamWidth: enemyStat.beamWidth!          // 빔 너비
        };

        const config: EnemyConfig = {
            color: color,
            size: size,
            moveSpeed: moveSpeed,
            health: health,
            attackConfig: attackConfig as AttackConfig,
            experiencePoint: experiencePoint
        };

        super(scene, config);

        // BeamAttack 인스턴스 생성
        this.beamAttack = new BeamAttack(scene, this, attackConfig);
        this.addAttack(this.beamAttack);
    }

    addAttack(attack: Attack): void {
        this.attacks.push(attack);
    }

    destroy() {
        this.beamAttack.destroy();
        super.destroy();
    }

    public getType(): string {
        return BeamShooterEnemy.TYPE;
    }
}
