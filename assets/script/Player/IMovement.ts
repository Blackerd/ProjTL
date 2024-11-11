export interface IMovement {
    move(deltaTime: number): void;
    checkGround(): void;
    checkForObstacles(): void;
    moveForward(deltaTime: number): void;
}