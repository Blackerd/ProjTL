import {
    _decorator, Component, Node, Vec3, input, Input, KeyCode,
    SkeletalAnimation, EventKeyboard, RigidBody, Contact2DType, geometry, PhysicsSystem,CollisionEventType ,
    Collider,
    Label

} from 'cc';
import { GameUI } from './GameUI';

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


    private moveDirection: number = 0; // Hướng di chuyển ngang (-1: trái, 0: không di chuyển, 1: phải)
    private canJump: boolean = false; // Kiểm tra trạng thái nhảy
    private isOnGround: boolean = false; // Kiểm tra xem nhân vật có đang đứng trên mặt đất không


    onLoad() {
        // Đăng ký sự kiện phím
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);


    }

    

    start() {
        this.playSlideAnimation(); // Chạy animation mặc định
    }

    update(deltaTime: number) {
        this.moveForward(deltaTime); // Di chuyển tự động về phía trước
        this.updateLateralMovement(deltaTime); // Cập nhật di chuyển ngang


         // Kiểm tra trạng thái mặt đất
         this.checkGround();
    }

    /** Kiểm tra nếu nhân vật ở trên mặt đất */
    private checkGround() {
        try {
            const ray = new geometry.Ray(this.node.position.x, this.node.position.y, this.node.position.z);
            ray.d.set(0, -1, 0); // Ray hướng xuống

            this.isOnGround = PhysicsSystem.instance.raycastClosest(ray, 0.5); // Tầm raycast kiểm tra mặt đất

            const defaultState = this.skeletalAnimation.getState('default');
            if (this.isOnGround && defaultState && !defaultState.isPlaying) {
                this.canJump = true;
            } else {
                this.canJump = false;
            }
        } catch (error) {
            console.error('Error checking ground status:', error);
            this.isOnGround = false;
            this.canJump = false;
        }
    }

    private jump() {
        if (this.canJump) {  // Kiểm tra nếu có thể nhảy
            const jumpVelocity = new Vec3(0, this.jumpForce, 0); // Lực nhảy trên trục Y
            this.rigidBody.applyImpulse(jumpVelocity); // Áp dụng lực nhảy
    
            // Chạy animation nhảy
            if (this.skeletalAnimation) {
                const jumpState = this.skeletalAnimation.getState('jump');
                if (!jumpState || !jumpState.isPlaying) {
                    this.skeletalAnimation.stop();
                    this.skeletalAnimation.play('jump');
                    this.skeletalAnimation.once(SkeletalAnimation.EventType.FINISHED, this.playSlideAnimation, this);
                }
            }
    
            this.isOnGround = false; // Đánh dấu là không còn trên mặt đất
        }
    }
    

    /** Tự động di chuyển về phía trước trên trục X */
    private moveForward(deltaTime: number) {
        if (this.rigidBody) {  // Kiểm tra nếu rigidBody không phải null
            const currentVelocity = new Vec3();
            this.rigidBody.getLinearVelocity(currentVelocity);  // Lấy vận tốc hiện tại

            const forwardVelocity = new Vec3(currentVelocity.x, currentVelocity.y, -this.forwardSpeed);
            this.rigidBody.setLinearVelocity(forwardVelocity);  // Áp dụng vận tốc mới
        } else {
            console.error("RigidBody is null or not initialized.");
        }
    }

/** Cập nhật di chuyển ngang trên trục Z */
private updateLateralMovement(deltaTime: number) {
    if (this.rigidBody) {  // Kiểm tra nếu rigidBody không phải null
        const currentVelocity = new Vec3();
        this.rigidBody.getLinearVelocity(currentVelocity);  // Lấy vận tốc hiện tại

        const lateralVelocity = new Vec3(this.moveDirection * this.lateralSpeed, currentVelocity.y, 0);

        // Cập nhật vận tốc mượt mà bằng cách sử dụng Vec3.lerp()
        const smoothVelocity = new Vec3();
        Vec3.lerp(smoothVelocity, currentVelocity, lateralVelocity, 0.1);  // Lerp giữa hai Vec3 với tỷ lệ 0.1

        // Cập nhật vận tốc mới
        this.rigidBody.setLinearVelocity(smoothVelocity);
    } else {
        console.error("RigidBody is null or not initialized.");
    }
}



    /** Xử lý sự kiện nhấn phím */
    private onKeyDown(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_A: // Di chuyển trái
                this.moveDirection = -1;
                this.playTurnAnimation(-1);
                break;
            case KeyCode.KEY_D: // Di chuyển phải
                this.moveDirection = 1;
                this.playTurnAnimation(1);
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
