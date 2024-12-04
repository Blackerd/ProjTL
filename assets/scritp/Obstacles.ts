import { _decorator, Component, Node, Collider, ITriggerEvent, director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Obstacles')
export class Obstacles extends Component {
    @property(Node)
    player: Node | null = null; // Node của người chơi

    @property(Node)
    gameOverUI: Node | null = null; // Màn hình Game Over

    start() {
        const collider = this.node.getComponent(Collider);
        if (collider) {
            collider.on('onTriggerEnter', this.onObstacleHit, this);
            collider.isTrigger = true; // Đảm bảo collider là trigger
        }
    }

    // Xử lý va chạm với chướng ngại vật
    onObstacleHit(event: ITriggerEvent) {
        const otherNode = event.otherCollider.node;

        // Kiểm tra nếu va chạm với player
        if (this.player && otherNode === this.player) {
            console.log('Game Over!');
            
            // Dừng tất cả hành động trong game
            this.gameOver();

            // Ẩn nhân vật hoặc làm các hành động khác khi game over
            this.player.active = false; // Ẩn nhân vật

            // Nếu cần có thêm các thao tác khác (ví dụ: ngừng chuyển động của chướng ngại vật)
            this.node.active = false; // Ẩn chướng ngại vật hoặc hủy
        }
    }

    // Hàm game over
    gameOver() {
        // Hiển thị UI game over
        if (this.gameOverUI) {
            this.gameOverUI.active = true;
        }

        // Dừng toàn bộ game
        director.pause(); // Dừng game
    }
}
