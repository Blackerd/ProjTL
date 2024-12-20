import { _decorator, Component, Node, Collider, ITriggerEvent, EventTarget } from 'cc';
import { Player } from './Player';
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

    private onObstacleHit(event: ITriggerEvent) {
        const otherNode = event.otherCollider.node;
    
        if (this.player && otherNode === this.player) {
            const playerComponent = this.player.getComponent(Player);
            if (playerComponent) {
                if (playerComponent.isShieldActive) {
                    console.log('Player hit an obstacle but is protected by the shield!');
                    event.selfCollider.node.destroy(); // Xóa chướng ngại vật
                } else if (playerComponent.hasRevive) {
                    console.log('Player hit an obstacle but revived!');
                    playerComponent.hasRevive = false; // Sử dụng trạng thái hồi sinh
                    event.selfCollider.node.destroy(); // Xóa chướng ngại vật
                } else {
                    console.log('Player hit an obstacle and has no protection! Game Over!');
                    eventTarget.emit('gameOver'); // Phát sự kiện gameOver
                }
            } else {
                console.error('Player component not found on node!');
            }
        }
    }
    
}

// Xuất EventTarget để GameUI có thể lắng nghe
export { eventTarget };
