import { _decorator, Component, Node, Collider, ITriggerEvent, EventTarget } from 'cc';
const { ccclass, property } = _decorator;

// Tạo EventTarget dùng để phát và lắng nghe sự kiện
const eventTarget = new EventTarget();

@ccclass('Obstacles')
export class Obstacles extends Component {
    @property(Node)
    player: Node | null = null; // Node của nhân vật

    start() {
        // Lấy tất cả các Node con (Obstacles)
        this.node.children.forEach((childNode) => {
            const collider = childNode.getComponent(Collider);
            if (collider) {
                collider.on('onTriggerEnter', this.onObstacleHit, this);
                collider.isTrigger = true; // Đảm bảo collider là trigger
            } else {
                console.warn(`Node ${childNode.name} does not have a Collider component.`);
            }
        });
    }

    /**
     * Xử lý khi va chạm với bất kỳ chướng ngại vật nào.
     * @param event Sự kiện va chạm
     */
    onObstacleHit(event: ITriggerEvent) {
        const otherNode = event.otherCollider.node;

        // Kiểm tra nếu va chạm với nhân vật
        if (this.player && otherNode === this.player) {
            console.log('Player hit an obstacle! Emitting gameOver event.');

            // Phát sự kiện "gameOver" để thông báo cho lớp GameUI
            eventTarget.emit('gameOver');
        }
    }
}

// Xuất EventTarget để GameUI có thể lắng nghe
export { eventTarget };
