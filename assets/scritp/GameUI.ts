import { _decorator, Component, Node, Label, Button, UITransform, input, Input, Vec3, director, view } from 'cc';
const { ccclass, property } = _decorator;
import { eventTarget } from './Obstacles';

@ccclass('GameUI')
export class GameUI extends Component {
    @property(Label)
    coinLabel: Label = null; // Hiển thị coin

    @property(Label)
    distanceLabel: Label = null; // Hiển thị quãng đường

    @property(Label)
    timeLabel: Label = null; // Hiển thị thời gian

    @property(Node)
    pauseButton: Node = null; // Nút Tạm dừng

    @property(Node)
    resumeButton: Node = null; // Nút Tiếp tục (ẩn mặc định)

    @property(Node)
    exitButton: Node = null; // Nút Thoát

    @property(Node)
    bxhNode: Node = null; // Node BXH

    @property(Node)
    backButton: Node = null; // Nút Back trong BXH

    @property(Node)
    winPanel: Node = null; // Panel hiển thị chiến thắng

    @property(Label)
    winLabel: Label = null; // Hiển thị thông báo chiến thắng

    @property(Node)
    backToMenuButton: Node = null; // Nút quay về Menu

    private startTime: number = 0; // Thời gian bắt đầu
    private isPaused: boolean = false; // Trạng thái dừng game
     coinCount: number = 0; // Số coin hiện tại
    private distanceTravelled: number = 0; // Quãng đường đã đi
    private isGameWon: boolean = false; // Trạng thái thắng game


    start() {
        this.startTime = Date.now(); // Lưu thời gian bắt đầu
        this.resumeButton.active = false; // Ẩn nút tiếp tục ban đầu
        this.bxhNode.active = false;
        this.winPanel.active = false; // Ẩn Panel chiến thắng ban đầu
        this.backToMenuButton.active = false; // Ẩn nút quay lại menu

        // Lắng nghe sự kiện "gameOver" từ Obstacles
        eventTarget.on('gameOver', this.showLeaderboard, this);


        // Đăng ký sự kiện cho các nút
        this.pauseButton.on(Input.EventType.TOUCH_START, this.pauseGame, this);
        this.resumeButton.on(Input.EventType.TOUCH_START, this.resumeGame, this);
        this.exitButton.on(Input.EventType.TOUCH_START, this.exitGame, this);
        this.backButton.on(Input.EventType.TOUCH_START, this.returnToMenu, this);
        this.backToMenuButton.on(Input.EventType.TOUCH_START, this.returnToMenu, this);

        this.updateResponsiveUI(); // Cập nhật responsive khi khởi chạy
        view.on('resize', this.updateResponsiveUI, this);

    }

    update(deltaTime: number) {
        if (!this.isPaused) {
            this.updateTime();
            this.updateDistance();
        }
    }

     /** Hàm cập nhật responsive UI */
     private updateResponsiveUI() {
        const visibleSize = view.getVisibleSize();

        // Điều chỉnh vị trí và kích thước của các thành phần UI
        if (this.pauseButton) {
            const pauseTransform = this.pauseButton.getComponent(UITransform);
            this.pauseButton.setPosition(
                visibleSize.width / 2 - pauseTransform.width / 2 - 20, // Căn phải
                visibleSize.height / 2 - pauseTransform.height / 2 - 20 // Căn trên
            );
        }

        if (this.coinLabel) {
            const coinTransform = this.coinLabel.getComponent(UITransform);
            this.coinLabel.node.setPosition(
                -visibleSize.width / 2 + coinTransform.width / 2 + 20, // Căn trái
                visibleSize.height / 2 - coinTransform.height / 2 - 20 // Căn trên
            );
        }

        if (this.timeLabel) {
            const timeTransform = this.timeLabel.getComponent(UITransform);
            this.timeLabel.node.setPosition(
                0, // Ở giữa theo chiều ngang
                visibleSize.height / 2 - timeTransform.height / 2 - 20 // Căn trên
            );
        }

        if (this.winPanel) {
            const winTransform = this.winPanel.getComponent(UITransform);
            this.winPanel.setPosition(0, 0); // Giữ panel ở giữa
            winTransform.width = visibleSize.width * 0.8; // Chiếm 80% chiều rộng
            winTransform.height = visibleSize.height * 0.5; // Chiếm 50% chiều cao
        }
    }


    /** Cập nhật thời gian chơi */
    private updateTime() {
        const currentTime = Date.now();
        const elapsedTime = Math.floor((currentTime - this.startTime) / 1000); // Tính bằng giây
        this.timeLabel.string = `Time: ${elapsedTime}s`;
    }

    /** Cập nhật số coin */
    public updateCoins(coinCount: number) {
        this.coinCount = coinCount;
        this.coinLabel.string = `Coins: ${this.coinCount}`;
    }

  /** Cập nhật quãng đường */
  public updateDistance() {
    this.distanceTravelled += 1; // Giả sử nhân vật di chuyển 1m mỗi frame (có thể thay đổi tuỳ theo logic của bạn)
    this.distanceLabel.string = `Distance: ${this.distanceTravelled}m`;

    // Kiểm tra nếu quãng đường đã đủ 5000m
    if (this.distanceTravelled >= 5000 && !this.isGameWon) {
        this.winGame();
    }
}

   /** Cơ chế win game khi đạt 5000m */
   private winGame() {

    director.pause();
    this.isPaused = true;
    this.isGameWon = true; // Đánh dấu trạng thái đã thắng
    this.winPanel.active = true; // Hiển thị thông báo chiến thắng
    this.backToMenuButton.active = true; // Hiển thị nút quay lại menu
}

  /** Tạm dừng trò chơi */
private pauseGame() {
    if (!this.isPaused) {
        this.isPaused = true;
        director.pause(); // Dừng toàn bộ trò chơi
        this.resumeButton.active = true; // Hiện nút tiếp tục
        this.pauseButton.active = false; // Ẩn nút tạm dừng
    }
}
/** Tiếp tục trò chơi */
private resumeGame() {
    if (this.isPaused) {
        this.isPaused = false;
        director.resume(); // Tiếp tục trò chơi từ trạng thái hiện tại
        this.resumeButton.active = false; // Ẩn nút tiếp tục
        this.pauseButton.active = true; // Hiện nút tạm dừng
    }
}

    /** Thoát trò chơi */
    private exitGame() {
        director.loadScene("MenuScene");
    }

    /** Hiển thị bảng xếp hạng */
    public showLeaderboard() {
        director.pause(); // Dừng trò chơi
        this.isPaused = true; // Đặt trạng thái tạm dừng
        this.pauseButton.active = false; // Ẩn nút tạm dừng
        this.resumeButton.active = false; // Ẩn nút tiếp tục
        this.bxhNode.active = true; // Hiển thị bảng xếp hạng
    }

     /** Quay về MenuScene */
     private returnToMenu() {
        director.resume(); // Tiếp tục trò chơi trước khi chuyển
        director.loadScene("MenuScene"); // Chuyển về MenuScene
    }

}
