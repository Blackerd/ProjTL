import {
    _decorator, Component, Node, Vec3, input, Input, KeyCode,
    SkeletalAnimation, EventKeyboard, RigidBody, Contact2DType, geometry, PhysicsSystem,CollisionEventType ,
    Collider,
    Label,
    Quat,
    log,
    tween

} from 'cc';

const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends Component {

    @property
    forwardSpeed: number = 100; // Tốc độ tự động di chuyển về phía trước (trục X)

    @property
    lateralSpeed: number = 1; // Tốc độ di chuyển ngang (trục Z)

    @property(SkeletalAnimation)
    skeletalAnimation: SkeletalAnimation = null; // Animation

    @property(RigidBody)
    rigidBody: RigidBody = null; // RigidBody của nhân vật

    @property(Collider)
    collider: Collider = null; // Collider của nhân vật

    @property
    jumpForce: number = 100; // Lực nhảy

    @property
    laneTransitionSpeed: number = 5; // Tốc độ chuyển lane

    @property(Node)
    shieldNode: Node = null;

    @property(Node)
    magnetNode: Node = null;

    @property
    magnetDuration: number = 5;

    


    private moveDirection: number = 0; // Hướng di chuyển ngang (-1: trái, 0: không di chuyển, 1: phải)
    private canJump: boolean = false; // Kiểm tra trạng thái nhảy
    private isOnGround: boolean = false; // Kiểm tra xem nhân vật có đang đứng trên mặt đất không
    private jumpCooldown: number = 2; // Thời gian cooldown giữa các lần nhảy (3 giây)
    private lastJumpTime: number = 0; // Thời gian nhảy cuối cùng

    private lanes = [-70, 0, 70]; // Xác định ba lane (trục Z)
    private currentLaneIndex = 1; // Vị trí mặc định ban đầu (giữa lane)
    private initialRotation: Quat = new Quat();

    public isShieldActive: boolean = false; // Trạng thái lá chắn
    private shieldDuration: number = 2; // Thời gian lá chắn hoạt động (giây)

    public isMagnetActive: boolean = false; // Trạng thái hiệu ứng nam châm

    public hasRevive: boolean = false; // Trạng thái hồi sinh


    onLoad() {

        // Đăng ký sự kiện phím
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);

         // Lắng nghe sự kiện "shieldActivated"
        this.node.on('shieldActivated', this.activateShield, this);

         // Lắng nghe sự kiện kích hoạt hiệu ứng nam châm
         this.node.on('magnetActivated', this.activateMagnet, this);

         // Lắng nghe sự kiện kích hoạt hồi sinh
        this.node.on('reviveActivated', this.activateRevive, this);

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

    private activateRevive() {
        this.hasRevive = true;
        console.log('Revive activated! Player can survive one obstacle.');
    }

    private activateMagnet() {
        if (!this.isMagnetActive) {
            this.isMagnetActive = true;
            console.log('Magnet activated!');
    
            // Hiện node magnet
            if (this.magnetNode) {
                this.magnetNode.active = true;
    
            // Làm nam châm xoay
            this.rotateMagnet();
            }
    
            // Tắt hiệu ứng nam châm sau một thời gian
            this.scheduleOnce(() => {
                this.deactivateMagnet();
            }, this.magnetDuration);
        }
    }

    

    private rotateMagnet() {
        if (this.magnetNode) {
            // Dừng mọi tween trước đó (nếu có)
            tween(this.magnetNode).stop();
    
            // Tạo tween để xoay liên tục
            tween(this.magnetNode)
                .by(1, { eulerAngles: new Vec3(0, 360, 0) }) // Xoay 360 độ quanh trục Y trong 1 giây
                .repeatForever() // Lặp lại mãi mãi
                .start();
        } else {
            console.error('magnetNode is null or not assigned.');
        }
    }
    

    private deactivateMagnet() {
        if (this.isMagnetActive) {
            console.log('Magnet deactivated!');
            this.isMagnetActive = false;
    
            // Ẩn node magnet
            if (this.magnetNode) {
                this.magnetNode.active = false;
            }
        }
    }
    
    

        /**
     * Kích hoạt trạng thái lá chắn.
     */
     
    private activateShield() {
        this.isShieldActive = true;
        console.log('Shield activated!');

        // Hiện node shield
        if (this.shieldNode) {
            this.shieldNode.active = true;

          
            // Làm shield xoay
            this.rotateShield();

            // Hủy trạng thái lá chắn sau một thời gian
            this.scheduleOnce(() => {
                this.deactivateShield();
            }, this.shieldDuration);
        }
    }

    private rotateShield() {
        if (this.shieldNode) {
            // Dừng mọi tween trước đó (nếu có)
            tween(this.shieldNode).stop();
    
            // Tạo tween để xoay liên tục
            tween(this.shieldNode)
                .by(1, { eulerAngles: new Vec3(0, 360, 0) }) // Xoay 360 độ quanh trục Y trong 1 giây
                .repeatForever() // Lặp lại mãi mãi
                .start();
        } else {
            console.error('shieldNode is null or not assigned.');
        }
    }
    

    private deactivateShield() {
        if (this.isShieldActive) {
            console.log('Shield deactivated!');
            this.isShieldActive = false;
    
            if (this.shieldNode) {
                // Dừng xoay
                tween(this.shieldNode).stop();
    
                // Đặt lại góc xoay (nếu cần)
                this.shieldNode.eulerAngles = new Vec3(0, 0, 0);
    
                // Ẩn node shield
                this.shieldNode.active = false;
            }
        }
    }
    
    
    
    private updateLateralMovement(deltaTime: number) {
        const targetZ = this.lanes[this.currentLaneIndex]; // Vị trí mục tiêu (lane)
        const currentPosition = this.node.getPosition(); // Vị trí hiện tại của nhân vật
    
        // Tính toán vị trí mới bằng cách sử dụng Lerp
        const newZ = currentPosition.z + (targetZ - currentPosition.z) * this.laneTransitionSpeed * deltaTime;
    
        // Cập nhật vị trí nhân vật
        this.node.setPosition(new Vec3(currentPosition.x, currentPosition.y, newZ));
    }
    
    private jump() {
        const currentTime = Date.now() / 1000; // Thời gian hiện tại tính bằng giây
    
        if (currentTime - this.lastJumpTime >= this.jumpCooldown) {
            const jumpVelocity = new Vec3(0, this.jumpForce + 100, 0); // Lực nhảy trên trục Y
            this.rigidBody.applyImpulse(jumpVelocity); // Áp dụng lực nhảy
    
            // Cập nhật thời gian nhảy
            this.lastJumpTime = currentTime;
    
            // Chọn ngẫu nhiên animation
            const animations = ['SpaceV1', 'SpaceV2'];
            const randomIndex = Math.floor(Math.random() * animations.length); // 0 hoặc 1
            const chosenAnimation = animations[randomIndex];
    
            console.log(`Playing jump animation: ${chosenAnimation}`);
    
            // Chạy animation nhảy
            if (this.skeletalAnimation) {
                const jumpState = this.skeletalAnimation.getState(chosenAnimation);
                if (!jumpState || !jumpState.isPlaying) {
                    this.skeletalAnimation.stop();
                    this.skeletalAnimation.play(chosenAnimation);
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
                if (this.currentLaneIndex > 0) { // Chỉ xử lý nếu chưa ở lane trái nhất
                    this.currentLaneIndex--; // Chuyển sang lane trái
                    this.playTurnAnimation(-1); // Animation chuyển hướng trái
                } else {
                    console.log("Already at the leftmost lane. Ignoring key A.");
                    return; // Bỏ qua sự kiện
                }
                break;
            case KeyCode.KEY_D: // Di chuyển phải
                if (this.currentLaneIndex < this.lanes.length - 1) { // Chỉ xử lý nếu chưa ở lane phải nhất
                    this.currentLaneIndex++; // Chuyển sang lane phải
                    this.playTurnAnimation(1); // Animation chuyển hướng phải
                } else {
                    console.log("Already at the rightmost lane. Ignoring key D.");
                    return; // Bỏ qua sự kiện
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
            this.skeletalAnimation.play('ArmatureAction');
        }
    }

    /** Animation chuyển hướng */
    private playTurnAnimation(direction: number) {
        if (this.skeletalAnimation) {
            const animationName = direction === -1 ? 'MoveToLeft' : 'MoveToRight';

            this.skeletalAnimation.stop();

            this.skeletalAnimation.play(animationName);

            
            // Khi animation chuyển hướng kết thúc, quay lại animation mặc định
            this.skeletalAnimation.once(SkeletalAnimation.EventType.FINISHED, () => {
                this.playSlideAnimation();
            }, this);
        }
    }


     handleGameOver() {
        if (this.hasRevive) {
            console.log('Revive used! Player continues playing.');
            this.hasRevive = false; // Sử dụng trạng thái hồi sinh
        } else {
            console.log('Game Over!');
            this.rigidBody.setLinearVelocity(new Vec3(0, 0, 0)); // Dừng nhân vật
        }
    }
 
}
