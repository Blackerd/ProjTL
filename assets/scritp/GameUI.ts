import { _decorator, Component, Node, Label, Button, input, Input, Vec3, director } from 'cc';
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

    private startTime: number = 0; // Thời gian bắt đầu
    private isPaused: boolean = false; // Trạng thái dừng game
     coinCount: number = 0; // Số coin hiện tại
    private distanceTravelled: number = 0; // Quãng đường đã đi

    start() {
        this.startTime = Date.now(); // Lưu thời gian bắt đầu
        this.resumeButton.active = false; // Ẩn nút tiếp tục ban đầu
        this.bxhNode.active = false;


        // Lắng nghe sự kiện "gameOver" từ Obstacles
        eventTarget.on('gameOver', this.showLeaderboard, this);


        // Đăng ký sự kiện cho các nút
        this.pauseButton.on(Input.EventType.TOUCH_START, this.pauseGame, this);
        this.resumeButton.on(Input.EventType.TOUCH_START, this.resumeGame, this);
        this.exitButton.on(Input.EventType.TOUCH_START, this.exitGame, this);
        this.backButton.on(Input.EventType.TOUCH_START, this.returnToMenu, this);

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
    if (!this.isPaused) {
        this.isPaused = true;
        director.pause(); // Dừng toàn bộ trò chơi
        this.resumeButton.active = true; // Hiện nút tiếp tục
        this.pauseButton.active = false; // Ẩn nút tạm dừng
        console.log('Trò chơi đã bị tạm dừng');
    }
}
/** Tiếp tục trò chơi */
private resumeGame() {
    if (this.isPaused) {
        this.isPaused = false;
        director.resume(); // Tiếp tục trò chơi từ trạng thái hiện tại
        this.resumeButton.active = false; // Ẩn nút tiếp tục
        this.pauseButton.active = true; // Hiện nút tạm dừng
        console.log('Trò chơi tiếp tục');
    }
}

    /** Thoát trò chơi */
    private exitGame() {
        console.log('Thoát game');
        director.loadScene("MenuScene");
    }

    /** Hiển thị bảng xếp hạng */
    public showLeaderboard() {
        console.log('Hiển thị bảng xếp hạng');
        director.pause(); // Dừng trò chơi
        this.isPaused = true; // Đặt trạng thái tạm dừng
        this.pauseButton.active = false; // Ẩn nút tạm dừng
        this.resumeButton.active = false; // Ẩn nút tiếp tục
        this.bxhNode.active = true; // Hiển thị bảng xếp hạng
    }

     /** Quay về MenuScene */
     private returnToMenu() {
        console.log('Quay về MenuScene');
        director.resume(); // Tiếp tục trò chơi trước khi chuyển
        director.loadScene("MenuScene"); // Chuyển về MenuScene
    }

}
