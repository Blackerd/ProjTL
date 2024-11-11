import { _decorator, Component, RigidBody, Collider, Node, Vec3, input, Input, KeyCode, EventKeyboard, SkeletalAnimation, PhysicsMaterial, PhysicMaterial } from 'cc';
import { ICharacter } from './ICharacter';
import { IMovement } from './IMovement';
import { IAnimation } from './IAnimation';
import { Movement } from './Movement';
import { Animation } from './Animation';

const { ccclass, property } = _decorator;

@ccclass('Character')
export class Character extends Component implements ICharacter {
    @property
    moveSpeed: number = 5;

    @property
    jumpForce: number = 3;

    @property(SkeletalAnimation)
    skeletalAnimation: SkeletalAnimation = null;

    @property(PhysicMaterial)
    private physicsMaterial: PhysicsMaterial = null;

    rigidBody: RigidBody;
    collider: Collider;
     movement: IMovement;
     animation: IAnimation;

    public isMovingLeft: boolean = false;
    public isMovingRight: boolean = false;
    isMovingForward: boolean = false;
    isJumping: boolean = false;
    canJump: boolean = true;
    isOnGround: boolean = false;
    isFlip: boolean = false;
    acceleration = 3;
    maxSpeed = 20;
    currentSpeed = 0;

    constructor() {
        super();
        this.movement = new Movement(this);
        this.animation = new Animation(this);
    }

    start() {
        this.rigidBody = this.getComponent(RigidBody);
        if (!this.rigidBody) {
            console.error('Không tìm thấy RigidBody');
        } else {
            console.log('RigidBody:', this.rigidBody);
        }

        this.collider = this.getComponent(Collider);
        if (!this.collider) {
            console.error('Không tìm thấy Collider');
        }

        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);

        this.animation.playSlideAnimation();
        this.movement.moveForward(0.1);
    }

    update(deltaTime: number) {
        this.movement.move(deltaTime);
        this.movement.checkGround();
    }

    private onKeyDown(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_A:
                this.isMovingLeft = true;
                break;
            case KeyCode.KEY_D:
                this.isMovingRight = true;
                this.animation.playLeftAnimation();
                break;
            case KeyCode.SPACE:
                if (!this.isJumping && this.isOnGround) {
                    this.jump();
                }
                break;
        }
        console.log("Key pressed:", event.keyCode);
    }

    private onKeyUp(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_A:
                this.isMovingLeft = false;
                break;
            case KeyCode.KEY_D:
                this.isMovingRight = false;
                this.animation.playSlideAnimation();
                break;
            case KeyCode.SPACE:
                this.onSpaceKeyReleased();
                break;
        }
    }

    private jump() {
        if (this.rigidBody && this.isOnGround && this.canJump) {
            const jumpVelocity = new Vec3(0, this.jumpForce, 0);
            this.rigidBody.setLinearVelocity(jumpVelocity);
            this.isJumping = true;
            this.isOnGround = false;
            this.canJump = false;
            this.animation.playJumpAnimation();

            this.skeletalAnimation.once(SkeletalAnimation.EventType.FINISHED, () => {
                this.isJumping = false;
                this.animation.playSlideAnimation();
            });
        }
    }

    private onSpaceKeyReleased() {
        this.isJumping = false;
    }


    onDestroy() {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    }
}