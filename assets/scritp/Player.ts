import {
    _decorator, Component, Node, Vec3, input, Input, KeyCode,
    SkeletalAnimation, EventKeyboard, RigidBody, Contact2DType, geometry, PhysicsSystem,CollisionEventType ,
    Collider,
    Label,
    Quat

} from 'cc';

const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends Component {
    @property
    forwardSpeed: number = 30; // Tốc độ tự động di chuyển về phía trước (trục X)

    @property
    lateralSpeed: number = 100; // Tốc độ di chuyển ngang (trục Z)

    @property(SkeletalAnimation)
    skeletalAnimation: SkeletalAnimation = null; // Animation

    @property(RigidBody)
    rigidBody: RigidBody = null; // RigidBody của nhân vật

    @property(Collider)
    collider: Collider = null; // Collider của nhân vật

    @property
    jumpForce: number = 10; // Lực nhảy

    @property
    laneTransitionSpeed: number = 10; // Tốc độ chuyển lane


    private moveDirection: number = 0; // Hướng di chuyển ngang (-1: trái, 0: không di chuyển, 1: phải)
    private canJump: boolean = false; // Kiểm tra trạng thái nhảy
    private isOnGround: boolean = false; // Kiểm tra xem nhân vật có đang đứng trên mặt đất không
    private jumpCooldown: number = 3; // Thời gian cooldown giữa các lần nhảy (3 giây)
    private lastJumpTime: number = 0; // Thời gian nhảy cuối cùng

    private lanes = [-70, 0, 70]; // Xác định ba lane (trục Z)
    private currentLaneIndex = 1; // Vị trí mặc định ban đầu (giữa lane)
    private initialRotation: Quat = new Quat();


    onLoad() {

        // Đăng ký sự kiện phím
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);

    }

    start() {
        this.playSlideAnimation(); // Chạy animation mặc định

        const laneWidth = Math.abs(this.lanes[1] - this.lanes[0]); // Đoạn cách giữa lane 0 và lane 1
        console.log(`Lane width: ${laneWidth}`);

    }

    update(deltaTime: number) {
        this.moveForward(deltaTime); // Di chuyển tự động về phía trước
        this.updateLateralMovement(deltaTime); // Cập nhật di chuyển ngang

    }
    private updateLateralMovement(deltaTime: number) {
        // Xác định vị trí mục tiêu dựa trên currentLaneIndex
        const targetZ = this.lanes[this.currentLaneIndex];
        const currentPosition = this.node.getPosition();

          // Sử dụng Lerp để làm mượt quá trình chuyển lane

    
        // Cập nhật vị trí mới ngay lập tức
        const newPosition = new Vec3(currentPosition.x, currentPosition.y, targetZ);
        this.node.setPosition(newPosition);
    }

private jump() {
    const currentTime = Date.now() / 1000; // Thời gian hiện tại tính bằng giây

    if (currentTime - this.lastJumpTime >= this.jumpCooldown) {
        const jumpVelocity = new Vec3(0, this.jumpForce, 0); // Lực nhảy trên trục Y
        this.rigidBody.applyImpulse(jumpVelocity); // Áp dụng lực nhảy

        // Cập nhật thời gian nhảy
        this.lastJumpTime = currentTime;

        // Chạy animation nhảy
        if (this.skeletalAnimation) {
            const jumpState = this.skeletalAnimation.getState('jumpp');
            if (!jumpState || !jumpState.isPlaying) {
                this.skeletalAnimation.stop();
                this.skeletalAnimation.play('jumpp');
                this.skeletalAnimation.once(SkeletalAnimation.EventType.FINISHED, this.playSlideAnimation, this);
            }
        }
    } else {
        console.log("Jump cooldown active. Please wait.");
    }
}
    
    
private moveForward(deltaTime: number) {
    if (this.rigidBody) {
        // Tính toán vận tốc cố định theo trục X
        const forwardDirection = new Vec3(1, 0, 0); // Hướng di chuyển mặc định (trục X)
        Vec3.transformQuat(forwardDirection, forwardDirection, this.node.getRotation()); // Áp dụng phép quay
        const forwardVelocity = forwardDirection.multiplyScalar(this.forwardSpeed);
        this.rigidBody.setLinearVelocity(forwardVelocity); // Áp dụng vận tốc
    } else {
        console.error("RigidBody is null or not initialized.");
    }
}


    /** Xử lý sự kiện nhấn phím */
    private onKeyDown(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_A: // Di chuyển trái
               // this.moveDirection = -1;
               this.playTurnAnimation(-1);
               if (this.currentLaneIndex > 0) {
                this.currentLaneIndex--; // Chuyển sang lane trái
            }
                break;
            case KeyCode.KEY_D: // Di chuyển phải
               // this.moveDirection = 1;
                this.playTurnAnimation(1);
                if (this.currentLaneIndex < this.lanes.length - 1) {
                    this.currentLaneIndex++; // Chuyển sang lane phải
                }
                break;
            case KeyCode.SPACE: // Nhảy
                this.jump();
                break;
        }
    }

    /** Xử lý sự kiện thả phím */
    private onKeyUp(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_A:
            case KeyCode.KEY_D:
                this.moveDirection = 0; // Dừng di chuyển ngang
                this.playSlideAnimation();
                break;
        }
    }

    /** Animation trượt mặc định */
    private playSlideAnimation() {
        if (this.skeletalAnimation) {
            this.skeletalAnimation.stop();
            this.skeletalAnimation.play('default');
        }
    }

    /** Animation chuyển hướng */
    private playTurnAnimation(direction: number) {
        if (this.skeletalAnimation) {
            const animationName = direction === -1 ? 'right' : 'right';

            this.skeletalAnimation.stop();

            this.skeletalAnimation.play(animationName);

            
            // Khi animation chuyển hướng kết thúc, quay lại animation mặc định
            this.skeletalAnimation.once(SkeletalAnimation.EventType.FINISHED, () => {
                this.playSlideAnimation();
            }, this);
        }
    }


    // Xử lý game over khi va chạm với chướng ngại vật
    private handleGameOver() {
        // Dừng mọi hoạt động của nhân vật, có thể hiển thị màn hình game over
        this.rigidBody.setLinearVelocity(new Vec3(0, 0, 0));  // Dừng nhân vật
        // Tạm dừng game hoặc thực hiện các hành động khác

    }
 
}
