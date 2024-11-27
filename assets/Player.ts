import {
    _decorator, Component, Node, Vec3, input, Input, KeyCode,
    RigidBody, SkeletalAnimation, Collider, EventKeyboard, geometry, PhysicsSystem, ITriggerEvent
} from 'cc';

const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends Component {
    @property
    moveSpeed: number = 10; // Tốc độ di chuyển về phía trước

    @property
    jumpForce: number = 20; // Lực nhảy

    @property
    roadWidth: number = 30; // Chiều rộng của đường (chia lane)

    @property(SkeletalAnimation)
    skeletalAnimation: SkeletalAnimation = null; // Thành phần animation

    private rigidBody: RigidBody = null;
    private currentLane: number = 0; // Lane hiện tại: -1 (trái), 0 (giữa), 1 (phải)
    private isOnGround: boolean = true; // Trạng thái trên mặt đất
    private laneWidth: number = 0; // Chiều rộng của một lane
    private coinsCollected: number = 0; // Số lượng coins đã thu thập
    private canJump = false;

    onLoad() {
        this.laneWidth = this.roadWidth / 3; // Tính chiều rộng mỗi lane
        this.rigidBody = this.getComponent(RigidBody);
        if (!this.rigidBody) {
            console.error('RigidBody không được gắn trên Player!');
        }

        const collider = this.getComponent(Collider);
        if (collider) {
            collider.on('onTriggerEnter', this.onCollisionEnter, this);
        }

        // Đăng ký sự kiện bàn phím
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    start() {
        this.playSlideAnimation();
    }

    update(deltaTime: number) {
        this.autoMoveForward();
        this.checkGround();
        this.limitPlayerMovement();
    }

    private limitPlayerMovement() {
        // Giới hạn di chuyển nhân vật trên trục X trong phạm vi của đường
        const maxX = this.roadWidth / 2;
        const minX = -this.roadWidth / 2;
        if (this.node.position.x > maxX) {
            this.node.position = new Vec3(maxX, this.node.position.y, this.node.position.z);
        } else if (this.node.position.x < minX) {
            this.node.position = new Vec3(minX, this.node.position.y, this.node.position.z);
        }
    }

    /** Tự động di chuyển về phía trước */
    private autoMoveForward() {
        const velocity = new Vec3(0, 0, this.moveSpeed);
        if (this.rigidBody) {
            this.rigidBody.setLinearVelocity(velocity);
        }
    }

    /** Kiểm tra nếu nhân vật ở trên mặt đất */
    private checkGround() {
        const ray = new geometry.Ray(this.node.position.x, this.node.position.y, this.node.position.z);
        ray.d.set(0, -1, 0); // Ray hướng xuống

        this.isOnGround = PhysicsSystem.instance.raycastClosest(ray, 0.5); // Tầm raycast kiểm tra mặt đất
        if (this.isOnGround && !this.skeletalAnimation.getState('default').isPlaying) {
            this.canJump = true;
        }
    }

    /** Xử lý nhảy */
    private jump() {
        if (this.isOnGround) {
            const jumpVelocity = new Vec3(0, this.jumpForce, 0); // Lực nhảy trên trục Y
            this.rigidBody.applyImpulse(jumpVelocity); // Áp dụng lực nhảy
    
            if (this.skeletalAnimation) {
                this.skeletalAnimation.stop();
                this.skeletalAnimation.play('jump');
            }
    
            this.isOnGround = false; // Đánh dấu là không còn trên mặt đất
        }
    }
    
    /** Chuyển lane */
    private moveToLane(direction: number) {
        const newLane = this.currentLane + direction;
        if (newLane < -1 || newLane > 1) return; // Giới hạn lane trong khoảng (-1, 0, 1)
    
        this.currentLane = newLane;
    
        // Tính toán vị trí mục tiêu
        const targetPositionX = this.currentLane * this.laneWidth;
        const targetPosition = new Vec3(
            Math.min(Math.max(-this.roadWidth / 2, targetPositionX), this.roadWidth / 2), // Giới hạn trong phạm vi roadWidth
            this.node.position.y,
            this.node.position.z
        );
        this.node.setPosition(targetPosition);
    
        // Chạy animation theo hướng di chuyển
        if (direction === -1) {
            this.playLeftAnimation();
        } else if (direction === 1) {
            this.playRightAnimation();
        }
    }
    

    /** Xử lý khi va chạm với các đối tượng khác */
    private onCollisionEnter(event: ITriggerEvent) {
        const otherNode = event.otherCollider.node;

        if (otherNode.name === 'coin') {
            otherNode.destroy(); // Xóa coin khi thu thập
            this.coinsCollected++;
        } else if (otherNode.name === 'obstacle') {
            this.gameOver(); // Dừng game khi va chạm chướng ngại vật
        }
    }

    /** Xử lý sự kiện phím nhấn xuống */
    private onKeyDown(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_A: // Di chuyển sang trái
                this.moveToLane(-1);
                break;
            case KeyCode.KEY_D: // Di chuyển sang phải
                this.moveToLane(1);
                break;
            case KeyCode.SPACE: // Nhảy
                this.jump();
                break;
        }
    }

    /** Xử lý sự kiện phím nhả ra */
    private onKeyUp(event: EventKeyboard) {
        if (event.keyCode === KeyCode.KEY_A || event.keyCode === KeyCode.KEY_D) {
            this.playSlideAnimation(); // Quay lại trạng thái trượt
        }
    }

    /** Animation trượt */
    private playSlideAnimation() {
        if (this.skeletalAnimation && !this.skeletalAnimation.getState('default').isPlaying) {
            this.skeletalAnimation.stop();
            this.skeletalAnimation.play('default');
        }
    }

    /** Animation di chuyển sang trái */
    private playLeftAnimation() {
        if (this.skeletalAnimation) {
            this.skeletalAnimation.stop();
            this.skeletalAnimation.play('left');
        }
    }

    /** Animation di chuyển sang phải */
    private playRightAnimation() {
        if (this.skeletalAnimation) {
            this.skeletalAnimation.stop();
            this.skeletalAnimation.play('right');
        }
    }

    /** Kết thúc game */
    private gameOver() {
        this.moveSpeed = 0;
        if (this.skeletalAnimation) {
            this.skeletalAnimation.stop();
        }
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);

        console.log('Game Over! Coins collected:', this.coinsCollected);
    }
}
