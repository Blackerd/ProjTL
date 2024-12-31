import { _decorator, Component, Node, Collider, ITriggerEvent, Label, AudioSource, Vec3, tween } from 'cc';
import { Player } from './Player';
const { ccclass, property } = _decorator;

@ccclass('CoinController')
export class CoinController extends Component {
    @property({ type: Node })
    player: Node | null = null; // Node của người chơi

    @property
    scorePerCoin: number = 10; // Số điểm mỗi đồng xu

    @property(Label)
    scoreLabel: Label | null = null; // Score label để hiển thị điểm

    @property
    collectDistance: number = 100; // Khoảng cách để thu thập co

    @property({ type: AudioSource })
    coinSound: AudioSource = null; // Âm thanh khi thu thập coin


    private _score: number = 0; // Biến lưu điểm

    @property
    magnetRadius: number = 100; // Bán kính ảnh hưởng của nam châm (m)

    @property
    magnetPullSpeed: number = 1000; // Tốc độ hút coin khi hiệu ứng nam châm được kích hoạt

    start() {
        // Gắn sự kiện va chạm cho tất cả các node coin con
        this.node.children.forEach((coinNode) => {
            const collider = coinNode.getComponent(Collider);
            if (collider) {
                collider.on('onTriggerEnter', this.onCoinCollected, this);
                 // Làm coin xoay liên tục bằng Tween
                 this.rotateCoin(coinNode);
            }
        });

    }

    update(deltaTime: number) {
        // Kiểm tra nếu Player và hiệu ứng nam châm đang hoạt động
        if (this.player) {
            const playerComponent = this.player.getComponent(Player);
            if (playerComponent && playerComponent.isMagnetActive) {
                const playerPosition = this.player.getWorldPosition();

                // Duyệt qua tất cả các coin
                this.node.children.forEach((coinNode) => {
                    if (!coinNode.active) return; // Bỏ qua coin đã bị thu thập

                    const coinPosition = coinNode.getWorldPosition();
                    const distanceToPlayer = Vec3.distance(playerPosition, coinPosition);

                    // Chỉ hút coin trong bán kính xác định
                    if (distanceToPlayer <= this.magnetRadius) {
                        const direction = new Vec3();
                        Vec3.subtract(direction, playerPosition, coinPosition);
                        direction.normalize();

                        // Di chuyển coin về phía Player
                        const moveStep = direction.multiplyScalar(this.magnetPullSpeed * deltaTime);
                        const newPosition = coinPosition.add(moveStep);
                        coinNode.setWorldPosition(newPosition);

                        // Nếu coin đủ gần Player, thu thập
                        if (Vec3.distance(playerPosition, newPosition) <= this.collectDistance) {
                            this.collectCoin(coinNode);
                        }
                    }
                });
            }
        }
    }

    private rotateCoin(coinNode: Node) {
        // Sử dụng tween để xoay coin
        tween(coinNode)
            .by(1, { eulerAngles: new Vec3(0, 360, 0) }) // Xoay 360 độ quanh trục Y trong 1 giây
            .repeatForever() // Lặp lại mãi mãi
            .start();
    }


       // Thu thập coin
       private collectCoin(coinNode: Node) {
        console.log('Coin collected automatically!');

        // Tăng điểm
        this.addScore(this.scorePerCoin);

        // Phát âm thanh khi thu thập coin
        if (this.coinSound) {
            this.coinSound.play(); // Phát âm thanh
        }

        // Ẩn hoặc hủy node coin
        coinNode.active = false; // Ẩn đồng xu thay vì hủy để tiết kiệm tài nguyên
    }


    // Xử lý sự kiện khi Player chạm vào coin
    onCoinCollected(event: ITriggerEvent) {
        const coinNode = event.selfCollider.node; // Lấy node coin bị va chạm
        const otherNode = event.otherCollider.node; // Lấy node gây va chạm

        // Kiểm tra nếu va chạm với player
        if (this.player && otherNode === this.player) {
            console.log('Coin collected!');

            // Tăng điểm
            this.addScore(this.scorePerCoin);


         // Phát âm thanh khi thu thập coin
         if (this.coinSound) {
            this.coinSound.play(); // Phát âm thanh
        }


            // Ẩn hoặc hủy node coin
            coinNode.active = false; // Ẩn đồng xu thay vì hủy để tiết kiệm tài nguyên
            // coinNode.destroy(); // Nếu bạn muốn hủy hoàn toàn thì có thể sử dụng dòng này
        }
    }

    // Hàm tăng điểm
    addScore(amount: number) {
        this._score += amount;
       // console.log(`Current Score: ${this._score}`);

        // Cập nhật điểm vào label UI
        if (this.scoreLabel) {
            this.scoreLabel.string = `Score: ${this._score}`;
        }
    }
}
