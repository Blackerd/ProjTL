import { _decorator, Component, Node, Label, Button, input, Input, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameUI')
export class GameUI extends Component {
    @property(Label)
    coinLabel: Label = null; // Hiển thị coin

    @property(Label)
    distanceLabel: Label = null; // Hiển thị quãng đường

    @property(Label)
    timeLabel: Label = null; // Hiển thị thời gian

    @property(Node)
    gameOverLabel: Node = null; // Thông báo Game Over

    @property(Node)
    pauseButton: Node = null; // Nút Tạm dừng

    @property(Node)
    resumeButton: Node = null; // Nút Tiếp tục (ẩn mặc định)

    @property(Node)
    exitButton: Node = null; // Nút Thoát

    private startTime: number = 0; // Thời gian bắt đầu
    private isPaused: boolean = false; // Trạng thái dừng game
    private coinCount: number = 0; // Số coin hiện tại
    private distanceTravelled: number = 0; // Quãng đường đã đi

    start() {
        this.startTime = Date.now(); // Lưu thời gian bắt đầu
        this.resumeButton.active = false; // Ẩn nút tiếp tục ban đầu
        this.gameOverLabel.active = false; // Ẩn thông báo Game Over

        // Đăng ký sự kiện cho các nút
        this.pauseButton.on(Input.EventType.TOUCH_START, this.pauseGame, this);
        this.resumeButton.on(Input.EventType.TOUCH_START, this.resumeGame, this);
        this.exitButton.on(Input.EventType.TOUCH_START, this.exitGame, this);
    }

    update(deltaTime: number) {
        if (!this.isPaused) {
            this.updateTime();
            this.updateDistance();
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
    }

    /** Tạm dừng trò chơi */
    private pauseGame() {
        this.isPaused = true;
        this.resumeButton.active = true; // Hiện nút tiếp tục
        this.pauseButton.active = false; // Ẩn nút tạm dừng
    }

    /** Tiếp tục trò chơi */
    private resumeGame() {
        this.isPaused = false;
        this.resumeButton.active = false; // Ẩn nút tiếp tục
        this.pauseButton.active = true; // Hiện nút tạm dừng
    }

    /** Thoát trò chơi */
    private exitGame() {
        console.log('Thoát game');
        // Chuyển về menu chính hoặc thoát ứng dụng
        // Nếu là trò chơi mobile, bạn có thể gọi API để thoát ứng dụng.
    }

    /** Hiển thị Game Over */
    public showGameOver() {
        this.isPaused = true; // Dừng game
        this.gameOverLabel.active = true; // Hiện thông báo Game Over
        this.pauseButton.active = false; // Ẩn nút tạm dừng
        this.resumeButton.active = false; // Ẩn nút tiếp tục
    }
}
