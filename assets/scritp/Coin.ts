import { _decorator, Component, Node, Collider, ITriggerEvent, Label, AudioSource } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CoinController')
export class CoinController extends Component {
    @property({ type: Node })
    player: Node | null = null; // Node của người chơi

    @property
    scorePerCoin: number = 10; // Số điểm mỗi đồng xu

    @property(Label)
    scoreLabel: Label | null = null; // Score label để hiển thị điểm

    @property({ type: AudioSource })
    coinSound: AudioSource = null; // Âm thanh khi thu thập coin


    private _score: number = 0; // Biến lưu điểm

    start() {
        // Gắn sự kiện va chạm cho tất cả các node coin con
        this.node.children.forEach((coinNode) => {
            const collider = coinNode.getComponent(Collider);
            if (collider) {
                collider.on('onTriggerEnter', this.onCoinCollected, this);
            }
        });
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
