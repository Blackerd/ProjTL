import { _decorator, Component, Node, Prefab, instantiate, Vec3, Collider, randomRangeInt, AudioSource, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Coin')
export class Coin extends Component {
    @property({ type: Prefab })
    coinPrefab: Prefab = null; // Prefab đồng xu

    @property({ type: Node })
    road: Node = null; // Node của đường

    @property({ type: AudioSource })
    globalCollectSound: AudioSource = null; // Âm thanh thu thập đồng xu dùng chung

    @property({ type: Node })
    scoreLabel: Node = null; // Node hiển thị điểm

    @property
    spawnInterval: number = 1; // Khoảng thời gian sinh đồng xu (giây)

    @property
    roadWidth: number = 3; // Chiều rộng đường để chia lane

    @property
    coinSpacing: number = 4; // Khoảng cách giữa các đồng xu (theo trục Z)

    private _lastCoinPosition: Vec3 = new Vec3(); // Vị trí đồng xu cuối cùng
    private _score: number = 0; // Điểm người chơi

    start() {
        // Lấy vị trí đồng xu gốc
        this._lastCoinPosition = this.node.position.clone();

        // Bắt đầu quá trình sinh đồng xu
        this.schedule(this.spawnCoins, this.spawnInterval);
    }

    spawnCoins() {
        // Chọn các lane (trái, giữa, phải)
        const laneOffset = 0.3;
        const lanePositions = [
            -this.roadWidth / 2 + laneOffset, // Lane trái
            0,                               // Lane giữa
            this.roadWidth / 2 - laneOffset  // Lane phải
        ];

        // Sinh 5 đồng xu liên tiếp
        for (let i = 0; i < 5; i++) {
            const coin = instantiate(this.coinPrefab); // Tạo đồng xu từ Prefab
            const lane = lanePositions[randomRangeInt(0, lanePositions.length)]; // Chọn lane ngẫu nhiên

            // Cập nhật vị trí đồng xu mới
            const newPosition = this._lastCoinPosition.clone();
            newPosition.x = lane; // Lane ngẫu nhiên
            newPosition.y = this.road.position.y + 0.5; // Đặt cao hơn đường một chút
            newPosition.z += this.coinSpacing; // Tăng theo trục Z
            coin.setPosition(newPosition);

            // Thêm đồng xu vào scene
            this.node.parent.addChild(coin);

            // Cập nhật vị trí đồng xu cuối cùng
            this._lastCoinPosition = newPosition;

            // Đảm bảo đồng xu có Collider và đăng ký sự kiện va chạm
            const collider = coin.getComponent(Collider);
            if (collider) {
                collider.on('onTriggerEnter', this.onTriggerEnter, this);
            }
        }
    }

    // Xử lý va chạm khi thu thập đồng xu
    onTriggerEnter(event) {
        const coinNode = event.selfCollider.node; // Lấy node đồng xu
        const otherNode = event.otherCollider.node; // Lấy node đối tượng va chạm
        if (otherNode.name === 'Player') {
            console.log('Coin collected!');

            // Phát âm thanh thu thập đồng xu
            if (this.globalCollectSound && !this.globalCollectSound.playing) {
                this.globalCollectSound.play();
            }

            this.addScore(10); // Cộng điểm
            coinNode.destroy(); // Xóa đồng xu
        }
    }

    addScore(amount: number) {
        this._score += amount; // Cộng điểm
        if (this.scoreLabel) {
            const labelComp = this.scoreLabel.getComponent(Label);
            if (labelComp) {
                labelComp.string = `Score: ${this._score}`;
            }
              // Phát âm thanh thu thập đồng xu
              if (this.globalCollectSound && !this.globalCollectSound.playing) {
                this.globalCollectSound.play();
            }

        }
    }

    update(deltaTime: number) {
        // Xóa đồng xu nếu nó rời khỏi khu vực chơi
        this.node.children.forEach((coinNode) => {
            if (coinNode.worldPosition.z < -10) { // Nếu Z < -10
                console.log('Coin out of bounds, destroying...');
                coinNode.destroy();
            }
        });
    }
}
