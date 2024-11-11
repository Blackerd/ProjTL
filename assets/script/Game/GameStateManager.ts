class GameStateManager {
    private static instance: GameStateManager;
    private score: number = 0;
    private level: number = 1;

    private constructor() {}

    public static getInstance(): GameStateManager {
        if (!GameStateManager.instance) {
            GameStateManager.instance = new GameStateManager();
        }
        return GameStateManager.instance;
    }

    public increaseScore(points: number) {
        this.score += points;
    }

    public setLevel(level: number) {
        this.level = level;
    }
}
