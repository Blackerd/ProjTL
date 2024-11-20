import {
    _decorator, geometry, physics, Component, Collider,
    Node, Vec3, input, Input, KeyCode, RigidBody,
    v3, EventKeyboard, SkeletalAnimation, PhysicsSystem,
    BoxCollider,
    MeshCollider,
    Label,
    instantiate,
    ITriggerEvent
} from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends Component {
    @property
    moveSpeed: number = 5; // Tốc độ di chuyển tự động

    @property(SkeletalAnimation)
    skeletalAnimation: SkeletalAnimation = null; // Animation của nhân vật

    @property(Node)
    gameOverLabel: Node = null; // UI thông báo Game Over

    @property(Label)
    coinLabel: Label = null; // UI hiển thị số coin

    @property(Node) 
    gameTrack: Node = null; // Node chứa các coin

    @property(Node)
    coinPrefab: Node = null; // Prefab của coin

    private coinsCollected: number = 0; // Số lượng coin đã thu thập

    private rigidBody: RigidBody;
    private isMovingLeft: boolean = false; // Trạng thái di chuyển sang trái
    private isMovingRight: boolean = false; // Trạng thái di chuyển sang phải
    canJump: boolean = true; // Trạng thái có thể nhảy
    isOnGround: boolean = false; // Trạng thái đang ở trên mặt đất

    onLoad() {
        // Đăng ký sự kiện va chạm
        const collider = this.getComponent(Collider);
        if (collider) {
            collider.on('onTriggerEnter', this.onCollisionEnter, this);
        }
    }

    start() {
        this.rigidBody = this.getComponent(RigidBody);
        if (!this.rigidBody) {
            console.error('Không tìm thấy RigidBody');
        }

        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);

        this.playSlideAnimation();

    }
    

    update(deltaTime: number) {
        this.autoMoveForward();
        this.handleSideMovement();
        this.checkGround();
        this.checkForObstacles();
    }

    // Di chuyển tự động về phía trước
    private autoMoveForward() {
        const currentVelocity = new Vec3(this.moveSpeed, 0, 0);
        this.rigidBody.setLinearVelocity(currentVelocity);
    }

    // Xử lý di chuyển trái/phải trên trục Z
    private handleSideMovement() {
        const currentVelocity = new Vec3();
        this.rigidBody.getLinearVelocity(currentVelocity);

        // Chỉ thay đổi vận tốc theo trục Z cho di chuyển trái/phải
        if (this.isMovingLeft) {
            currentVelocity.z = -this.moveSpeed; // Di chuyển sang trái
            this.rigidBody.setLinearVelocity(currentVelocity);
            this.playLeftAnimation();
        } else if (this.isMovingRight) {
            currentVelocity.z = this.moveSpeed; // Di chuyển sang phải
            this.rigidBody.setLinearVelocity(currentVelocity);
        } else {
            // Nếu không di chuyển trái/phải, đặt vận tốc trục Z là 0
            currentVelocity.z = 0;
            this.rigidBody.setLinearVelocity(currentVelocity);
        }
    }

    // Kiểm tra va chạm với chướng ngại vật theo hướng X
    private checkForObstacles() {
        const ray = new geometry.Ray(this.node.position.x, this.node.position.y, this.node.position.z);
        ray.d.set(1, 0, 0); // Định hướng raycast theo trục X

        if (PhysicsSystem.instance.raycastClosest(ray, 0.2)) {
            const result = PhysicsSystem.instance.raycastClosestResult;
            if (result && result.collider) {
                this.gameOver(); // Dừng game khi va chạm
            }
        }
    }

    private gameOver() {
        this.isMovingLeft = false;
        this.isMovingRight = false;
        this.moveSpeed = 0;
        
        // Hiển thị thông báo "Game Over"
        if (this.gameOverLabel) {
            this.gameOverLabel.active = true;
            const label = this.gameOverLabel.getComponent(Label);
            if (label) {
                label.string = "Game Over!";
            }
        }

        // Dừng animation
        if (this.skeletalAnimation) {
            this.skeletalAnimation.stop();
        }

        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);

        this.enabled = false;
    }

    private onKeyDown(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_A:
                this.isMovingLeft = true;
                break;
            case KeyCode.KEY_D:
                this.isMovingRight = true;
                break;
            case KeyCode.SPACE:
                if (this.isOnGround) {
                    this.jump();
                }
                break;
        }
    }

    private onKeyUp(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_A:
                this.isMovingLeft = false;
                break;
            case KeyCode.KEY_D:
                this.isMovingRight = false;
                this.playSlideAnimation();
                break;
            case KeyCode.SPACE:
                this.canJump = false;
                break;
        }
    }

    private playSlideAnimation() {
        if (this.skeletalAnimation && !this.skeletalAnimation.getState('default').isPlaying) {
            this.skeletalAnimation.stop();
            this.skeletalAnimation.play('default');
        }
    }

    private playLeftAnimation() {
        if (this.skeletalAnimation && !this.skeletalAnimation.getState('left').isPlaying) {
            this.skeletalAnimation.stop();
            this.skeletalAnimation.play('left');
        }
    }

    private playRightAnimation() {
        if (this.skeletalAnimation && !this.skeletalAnimation.getState('right').isPlaying) {
            this.skeletalAnimation.stop();
            this.skeletalAnimation.play('right');
        }
    }

    private jump() {
        const jumpVelocity = new Vec3(0, 20, 0);
        this.rigidBody.applyImpulse(jumpVelocity, Vec3.ZERO);

        if (this.skeletalAnimation && !this.skeletalAnimation.getState('jumpp').isPlaying) {
            this.skeletalAnimation.stop();
            this.skeletalAnimation.play('jumpp');
        }

        this.canJump = false;
    }

    onCollisionEnter(event: ITriggerEvent) {
        const other = event.otherCollider;
        if (other.node.name === 'coin') {
            // Xóa đồng xu khi nhân vật thu thập
            other.node.destroy();
    
            // Cộng thêm số coin
            this.coinsCollected++;
    
            // Cập nhật UI hiển thị số coin
            this.updateCoinLabel();
    
            console.log(`Thu thập coin! Tổng số coin: ${this.coinsCollected}`);
        }
    }
    

    private updateCoinLabel() {
        if (this.coinLabel) {
            this.coinLabel.getComponent(Label).string = `Coins: ${this.coinsCollected}`; // Cập nhật số coin lên UI
        }
    }

    private checkGround() {
        const ray = new geometry.Ray(this.node.position.x, this.node.position.y, this.node.position.z);
        ray.d.set(0, -1, 0); // Ray hướng xuống dưới để kiểm tra mặt đất
        this.isOnGround = PhysicsSystem.instance.raycastClosest(ray, 1 << 0);
    }
}
