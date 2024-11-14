export enum DepthLayer {
    BACKGROUND = 0,
    EFFECT = 100,
    PLAYER = 200,
    ENEMY = 300,
    PROJECTILE = 400,
    UI = 500,
}

class DepthManager {
    private static instance: DepthManager;

    private constructor() {

    }

    public static getInstance(): DepthManager {
        if (!DepthManager.instance) {
            DepthManager.instance = new DepthManager();
        }
        return DepthManager.instance;
    }

    public getDepth(layer: DepthLayer): number {
        return layer;
    }
}

export default DepthManager;
