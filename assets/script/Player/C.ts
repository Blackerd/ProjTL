import {
    _decorator, geometry,TerrainCollider, physics, Component, Collider,
    Node, Vec3, input, Input, KeyCode, RigidBody,
    v3, EventKeyboard, SkeletalAnimation, PhysicsRayResult, PhysicsSystem,
    BoxCollider,
    MeshCollider
} from 'cc';
const { ccclass, property } = _decorator;

@ccclass('C')
export class C extends Component {
    @property
    moveSpeed: number = 5; // Tốc độ di chuyển tự động

    @property
    jumpForce: number = 3; // Lực nhảy

    @property(SkeletalAnimation)
    skeletalAnimation: SkeletalAnimation = null; // Animation của nhân vật

    private rigidBody: RigidBody;
    private isMovingLeft: boolean = false; // Trạng thái di chuyển sang trái
    private isMovingRight: boolean = false; // Trạng thái di chuyển sang phải
    private isMovingForward: boolean = false; // Trạng thái di chuyển về phía trước
    private isJumping: boolean = false; // Trạng thái nhảy
    isOnGround: boolean = false; // Trạng thái đang ở trên mặt đất
    private isFlip: boolean = false; // Trạng thái lộn
    private acceleration = 2; // gia tốc
    private maxSpeed = 20; // vận tốc tối đa
    private currentSpeed = 0; // vận tốc hiện tại

    start() {
        // Lấy RigidBody của nhân vật để xử lý vật lý
        this.rigidBody = this.getComponent(RigidBody);
        if (!this.rigidBody) {
            console.error('Không tìm thấy RigidBody');
        } else {
            console.log('RigidBody của nhân vật đã được gán');
        }

        const collider = this.getComponent(Collider);
        if (!collider) {
            console.error('Không tìm thấy Collider');
        } else {
            console.log('Collider của nhân vật đã được gán');
        }
        
        // Đăng ký sự kiện phím nhấn
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);

        // Chạy animation trượt
        this.playSlideAnimation();
    }

    update(deltaTime: number) {
       this.move(deltaTime);
        this.checkGround();
    }
    private move(deltaTime: number) {  
        const direction = new Vec3();  
        if (this.isMovingLeft) direction.x -= 1; // Di chuyển sang trái  
        if (this.isMovingRight) direction.x += 1; // Di chuyển sang phải  
        if (this.isMovingForward) direction.z -= 1; // Di chuyển về phía trước

        // Đưa hướng về đơn vị  
        direction.normalize();  

        // Cập nhật vận tốc hiện tại dựa trên gia tốc  
        if (direction.length() > 0) {  
            this.currentSpeed += this.acceleration * deltaTime;  
        } else {  
            this.currentSpeed -= this.acceleration * deltaTime;  
        }  

        // Đảm bảo vận tốc không vượt quá vận tốc tối đa  
        this.currentSpeed = Math.min(this.currentSpeed, this.maxSpeed);  
        this.currentSpeed = Math.max(this.currentSpeed, 0);  

        // lấy vận tốc hiện tại
        const currentVelocity = new Vec3();
        this.rigidBody.getLinearVelocity(currentVelocity);

        // Cập nhật vị trí của nhân vật
        const velocity = new Vec3(direction.x * this.currentSpeed, currentVelocity.y, direction.z * this.currentSpeed);
        this.rigidBody.setLinearVelocity(velocity);
    }  
    private checkGround() {
        // Start ray a little above the character's position to ensure it intersects the ground
        const characterPosition = this.node.position.clone();
        characterPosition.y += 0.1; // Adjust this value as needed to ensure the ray starts slightly above ground level
    
        const direction = new Vec3(0, -1, 0); // Cast ray directly downward
        const rayLength = 2; // Temporarily increase the length for debugging
    
        // Create and set up the ray
        const ray = new geometry.Ray();
        ray.o.set(characterPosition.x, characterPosition.y, characterPosition.z);
        ray.d.set(direction.x, direction.y, direction.z);
    
        // Perform the raycast
        const hit = PhysicsSystem.instance.raycastClosest(ray, 1 << 0); // Default layer is 0
    
        // Check for hit and process the result
        this.isOnGround = hit;
        if (hit) {
            const result = PhysicsSystem.instance.raycastClosestResult;
            if (result && result.collider) {
                console.log("Chạm đát:", result.collider.node.name);
            }
        } else {
            console.log("Không chạm đất.");
        }
    
        // Log isOnGround status for debugging
        console.log("Is on ground:", this.isOnGround);
    }
    
    

    private checkForObstacles() {
        const characterPosition = this.node.position.clone();
        const rayLength = 1.0; // Ray length for obstacle detection
        const directions = [
            new Vec3(0, 0, -1), // Forward
            new Vec3(0, 0, 1),  // Backward
            new Vec3(-1, 0, 0), // Left
            new Vec3(1, 0, 0)   // Right
        ];
        const rigidBody = this.getComponent(RigidBody);
    
        // Loop through each direction and cast a ray
        directions.forEach((direction, index) => {
            const ray = new geometry.Ray();
            ray.o.set(characterPosition.x, characterPosition.y, characterPosition.z);
            ray.d.set(direction.x, direction.y, direction.z);
    
            // Cast ray and check for the closest hit
            const hit = PhysicsSystem.instance.raycastClosest(ray, 1 << 0); // Default layer is 0
    
            if (hit) {
                const result = PhysicsSystem.instance.raycastClosestResult;
                if (result && result.collider) {
                    console.log("Va chạm với:", result.collider.node.name);
    
                    // If obstacle detected, stop movement in the respective direction
                    const currentVelocity = new Vec3();
                    rigidBody.getLinearVelocity(currentVelocity); // Get the current velocity
    
                    switch (index) {
                        case 0: // Forward
                            console.log("Obstacle detected in front");
                            // Stop forward movement by setting Z component of velocity to 0
                            currentVelocity.z = Math.max(0, currentVelocity.z); // Prevent reverse motion
                            rigidBody.setLinearVelocity(currentVelocity);
                            break;
                        case 1: // Backward
                            console.log("Obstacle detected behind");
                            // Stop backward movement by setting Z component of velocity to 0
                            currentVelocity.z = Math.min(0, currentVelocity.z); // Prevent forward motion
                            rigidBody.setLinearVelocity(currentVelocity);
                            break;
                        case 2: // Left
                            console.log("Obstacle detected on the left");
                            // Stop left movement by setting X component of velocity to 0
                            currentVelocity.x = Math.max(0, currentVelocity.x); // Prevent right motion
                            rigidBody.setLinearVelocity(currentVelocity);
                            break;
                        case 3: // Right
                            console.log("Obstacle detected on the right");
                            // Stop right movement by setting X component of velocity to 0
                            currentVelocity.x = Math.min(0, currentVelocity.x); // Prevent left motion
                            rigidBody.setLinearVelocity(currentVelocity);
                            break;
                    }
                }
            }
        });
    }
    

    // Hàm di chuyển liên tục về phía trước của nhân vật theo bề mặt của map
    private moveForward(deltaTime: number) {
        if (this.rigidBody) {
            const currentVelocity = new Vec3(0, 0, 0);
            this.rigidBody.getLinearVelocity(currentVelocity);

            // Di chuyển nhân vật về phía trước theo vận tốc 
            if(this.isOnGround){
                currentVelocity.z = -this.moveSpeed;
                this.rigidBody.setLinearVelocity(currentVelocity);
            }
                
        }
     
    }

private onKeyDown(event: EventKeyboard) {
    switch (event.keyCode) {
        case KeyCode.KEY_A: // Di chuyển sang trái
            this.isMovingLeft = true;
            break;
        case KeyCode.KEY_D: // Di chuyển sang phải
            this.isMovingRight = true;
            this.playLeftAnimation();
            break;
        case KeyCode.KEY_W: // Di chuyển về phía trước
            this.isMovingForward = true;
            this.moveForward(1);
            break;
        case KeyCode.SPACE: // Nhảy
        if (!this.isJumping && this.isOnGround) {
            this.jump();
        }
            break;
    }
    console.log("Key pressed:", event.keyCode); // Thêm log để kiểm tra phím được nhấn
}

private onKeyUp(event: EventKeyboard) {
    switch (event.keyCode) {
        case KeyCode.KEY_A:
        case KeyCode.KEY_D:
        case KeyCode.KEY_W:
            this.isMovingLeft = false;
            this.isMovingRight = false;
            this.isMovingForward = false;
            // Return to slide animation when movement stops
            this.playSlideAnimation();
            break;
        case KeyCode.SPACE:
            this.isJumping = false;
            break;
    }
}

    // Hàm để phát animation trượt
    private playSlideAnimation() {
        if (this.skeletalAnimation && !this.skeletalAnimation.getState('default').isPlaying) {
            this.skeletalAnimation.stop();
            this.skeletalAnimation.play('default');
        }
    }

    // Phát animation nhảy
    private playJumpAnimation() {
        if (this.skeletalAnimation && !this.skeletalAnimation.getState('jump').isPlaying) {
            this.skeletalAnimation.stop();
            this.skeletalAnimation.play('jump');
        }
    }
    // Lộn 
    private playFlipAnimation() {
        if (this.skeletalAnimation && !this.skeletalAnimation.getState('flip').isPlaying) {
            this.skeletalAnimation.stop();
            this.skeletalAnimation.play('flip');
        }
    }
    // qua trái
    private playLeftAnimation() {
        if (this.skeletalAnimation && !this.skeletalAnimation.getState('left').isPlaying) {
            this.skeletalAnimation.stop();
            this.skeletalAnimation.play('left');
        }
    }
    // Hàm xử lý nhảy
    private jump() {
        if (this.rigidBody && this.isOnGround) {
            const jumpVelocity = new Vec3(0, this.jumpForce, 0);
            this.rigidBody.setLinearVelocity(jumpVelocity);
            this.isJumping = true;
            this.isOnGround = false;
            this.playJumpAnimation();
    
            // Listen for when jump animation ends, then return to sliding
            this.skeletalAnimation.once(SkeletalAnimation.EventType.FINISHED, () => {
                this.isJumping = false;
                this.playSlideAnimation(); // Chuyển về animation trượt
            });
        }
    }
    // xử lý qua trái 
    private moveLeft() {
        if (this.rigidBody) {
            const currentVelocity = new Vec3(0, 0, 0);
            this.rigidBody.getLinearVelocity(currentVelocity);
            currentVelocity.x = +this.moveSpeed;
            this.rigidBody.setLinearVelocity(currentVelocity);
            this.playLeftAnimation();
        }
    }
    // Lộn
    private flip() {
        if (!this.isFlip && this.isOnGround) { // Only flip if grounded
            this.isFlip = true;
            this.playFlipAnimation();
    
            // When flip animation ends, reset to sliding
            this.skeletalAnimation.once(SkeletalAnimation.EventType.FINISHED, () => {
                this.isFlip = false;
                this.playSlideAnimation();
            });
        }
    }
   // Khi va chạm bắt đầu
onCollisionEnter(other: Collider) {
    console.log("Va chạm giữa nhân vật và map1", other.node.name);
    // Kiểm tra xem collider có phải là MeshCollider không  
    if (other.node.getComponent(MeshCollider)) {
        console.log("Va chạm với MeshCollider");
        this.isOnGround = true;
        this.isJumping = false;
        this.playSlideAnimation();
    } else {
        console.log("Không phải MeshCollider");
    }
}

// Khi va chạm tiếp tục
onCollisionStay(other: Collider) {
    if (other.node.getComponent(MeshCollider)) {
        console.log("Đang va chạm với MeshCollider");
        this.isOnGround = true;
        this.isJumping = false;
    }
}

// Khi va chạm kết thúc
onCollisionExit(other: Collider) {
    if (other.node.getComponent(MeshCollider)) {
        console.log("Left collision with MeshCollider");
        this.isOnGround = false;

        // Nếu nhân vật không còn va chạm với mặt đất, quay lại animation trượt
        if (!this.isJumping && !this.isFlip) {
            this.playSlideAnimation();
        }
    }
}

    // Hủy đăng ký sự kiện khi component bị hủy
    onDestroy() {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    }
}