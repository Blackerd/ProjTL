import { Vec3, geometry, PhysicsSystem, _decorator, Component, PhysicMaterial, PhysicsMaterial, RigidBody, Quat } from 'cc';
import { IMovement } from './IMovement';
import { Character } from './Character';

const { ccclass, property } = _decorator;

@ccclass('Movement')
export class Movement extends Component implements IMovement {
    @property(Character)
    private character: Character;

    @property(PhysicMaterial)
    private physicsMaterial: PhysicsMaterial = null;

    @property
    private moveForce: number = 50; // lực đẩy

    @property
    private drag: number = 0.9; // lực cản

    private forwardDirection: Vec3 = new Vec3(); // hướng di chuyển
    private rightDirection: Vec3 = new Vec3(); // // Hướng phải, trái sẽ là ngược lại
    private direction: Vec3 = new Vec3(); // Vector di chuyển dựa trên phím bấm

    constructor(character: Character) {
        super();
        this.character = character;
    }

    move(deltaTime: number): void {
        this.calculateMovementDirections();
        this.handleInput();
        this.applyMovement(deltaTime);
        this.applyDrag();
    }


    update(deltaTime: number) {
        this.handleInput();
        this.calculateMovementDirections();
        this.applyMovement(deltaTime);
        this.applyGravity();
        this.applyAutoSlide(deltaTime);
        this.applyDrag();
    }
    

    moveForward(deltaTime: number): void {
        const forwardForce = new Vec3(this.forwardDirection.x * this.moveForce, 0, this.forwardDirection.z * this.moveForce);
        this.character.rigidBody?.applyForce(forwardForce);
    }

    private calculateMovementDirections() {

            if (!this.character || !this.character.node) {
                console.error("Character or character node is not defined.");
                return;
            }
        
        // Tính toán hướng "forward" của nhân vật
        Vec3.transformQuat(this.forwardDirection, Vec3.FORWARD, this.character.node.getWorldRotation(new Quat()));
        this.forwardDirection.y = 0;
        this.forwardDirection.normalize();
    
        // Kiểm tra hướng bề mặt mà nhân vật tiếp xúc
        const groundNormal = this.getGroundNormal();
        if (groundNormal) {
            // Áp dụng vector pháp tuyến của bề mặt vào hướng "forward"
            Vec3.cross(this.rightDirection, groundNormal, this.forwardDirection);
            this.rightDirection.normalize();
            Vec3.cross(this.forwardDirection, groundNormal, this.rightDirection);
        }
    }
    
    private getGroundNormal(): Vec3 | null {
        const ray = new geometry.Ray();
        const characterPosition = this.character.node.position.clone();
        characterPosition.y += 0.2;
        ray.o.set(characterPosition.x, characterPosition.y, characterPosition.z);
        ray.d.set(0, -1, 0);
    
        const layerMask = PhysicsSystem.PhysicsGroup.DEFAULT;
        if (PhysicsSystem.instance.raycastClosest(ray, layerMask)) {
            const result = PhysicsSystem.instance.raycastClosestResult;
            if (result) {
                return result.hitNormal.clone();
            }
        }
        return null;
    }

    private applyGravity() {
        const groundNormal = this.getGroundNormal();
        if (groundNormal) {
            // Áp dụng lực kéo nhẹ dọc theo bề mặt
            const gravityForce = new Vec3();
            gravityForce.set(groundNormal.x, groundNormal.y, groundNormal.z).multiplyScalar(-this.character.rigidBody.mass * 9.8 * 0.1); // Điều chỉnh lực trọng lực phù hợp
            this.character.rigidBody.applyForce(gravityForce);
        } else {
            // Nếu không có groundNormal, áp dụng trọng lực theo hướng xuống
            const gravityForce = new Vec3(0, -this.character.rigidBody.mass * 9.8, 0);
            this.character.rigidBody.applyForce(gravityForce);
        }
    }
    

    private applyAutoSlide(deltaTime: number) {
        const groundNormal = this.getGroundNormal();
        if (groundNormal) {
            const slideDirection = new Vec3();
            Vec3.cross(slideDirection, Vec3.UP, groundNormal);
            slideDirection.normalize();
    
            const slideForce = new Vec3(slideDirection.x * this.moveForce, 0, slideDirection.z * this.moveForce);
            this.character.rigidBody.applyForce(slideForce);
        }
    }
    
    

    private handleInput() {

        if (!this.character) {
            console.error('Character is not initialized');
            return;
        }
        
        console.log("isMovingLeft:", this.character.isMovingLeft);  // Thêm log ở đây
        this.direction.set(0, 0, 0);  // Reset hướng di chuyển
    
        if (this.character.isMovingLeft) {
            const leftDirection = new Vec3();
            Vec3.negate(leftDirection, this.rightDirection);  // Tạo hướng ngược lại để di chuyển trái
            this.direction.add(leftDirection);  // Di chuyển trái
        }
        if (this.character.isMovingRight) {
            this.direction.add(this.rightDirection);  // Di chuyển phải
        }
    
        this.direction.normalize();  // Chuẩn hóa để duy trì nhất quán về tốc độ
    }
    

    private applyMovement(deltaTime: number) {
        if (this.direction.length() > 0) {
            const force = new Vec3(this.direction.x * this.moveForce, 0, this.direction.z * this.moveForce);
            this.character.rigidBody?.applyForce(force);
        }
        // Thêm lực trượt về phía trước bất kể hướng quay của nhân vật
        this.moveForward(deltaTime);
    }
    

    private applyDrag() {
        const velocity = new Vec3();
        this.character.rigidBody.getLinearVelocity(velocity);

        velocity.x *= this.drag;
        velocity.z *= this.drag;

        this.character.rigidBody.setLinearVelocity(velocity);
    }
    checkGround(): void {
        const characterPosition = this.character.node.position.clone();
        characterPosition.y += 0.2;

        const direction = new Vec3(0, -1, 0);
        const rayLength = 2;

        const ray = new geometry.Ray();
        ray.o.set(characterPosition.x, characterPosition.y, characterPosition.z);
        ray.d.set(direction.x, direction.y, direction.z);

        const layerMask = PhysicsSystem.PhysicsGroup.DEFAULT;

        const hit = PhysicsSystem.instance.raycastClosest(ray, layerMask);

        this.character.isOnGround = hit;
        if (hit) {
            const result = PhysicsSystem.instance.raycastClosestResult;
            if (result && result.collider) {
                console.log("Chạm đát:", result.collider.node.name);
            }
        } else {
            console.log("Không chạm đất.");
        }

        console.log("Is on ground:", this.character.isOnGround);
    }

    checkForObstacles(): void {
        const characterPosition = this.character.node.position.clone();
        const rayLength = 1.0;
        const directions = [
            new Vec3(0, 0, -1),
            new Vec3(0, 0, 1),
            new Vec3(-1, 0, 0),
            new Vec3(1, 0, 0)
        ];

        directions.forEach((direction, index) => {
            const ray = new geometry.Ray();
            ray.o.set(characterPosition.x, characterPosition.y, characterPosition.z);
            ray.d.set(direction.x, direction.y, direction.z);

            const hit = PhysicsSystem.instance.raycastClosest(ray, 1 << 0);

            if (hit) {
                const result = PhysicsSystem.instance.raycastClosestResult;
                if (result && result.collider) {
                    console.log("Va chạm với:", result.collider.node.name);

                    const currentVelocity = new Vec3();
                    this.character.rigidBody.getLinearVelocity(currentVelocity);

                    switch (index) {
                        case 0:
                            console.log("Obstacle detected in front");
                            currentVelocity.z = Math.max(0, currentVelocity.z);
                            this.character.rigidBody.setLinearVelocity(currentVelocity);
                            break;
                        case 1:
                            console.log("Obstacle detected behind");
                            currentVelocity.z = Math.min(0, currentVelocity.z);
                            this.character.rigidBody.setLinearVelocity(currentVelocity);
                            break;
                        case 2:
                            console.log("Obstacle detected on the left");
                            currentVelocity.x = Math.max(0, currentVelocity.x);
                            this.character.rigidBody.setLinearVelocity(currentVelocity);
                            break;
                        case 3:
                            console.log("Obstacle detected on the right");
                            currentVelocity.x = Math.min(0, currentVelocity.x);
                            this.character.rigidBody.setLinearVelocity(currentVelocity);
                            break;
                    }
                }
            }
        });
    }

   
}