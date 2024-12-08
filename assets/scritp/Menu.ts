import { _decorator, Component, Node, director, Label, Button } from 'cc';
import { WebSocketManager } from './WebSocketManager';
const { ccclass, property } = _decorator;

@ccclass('Menu')
export class Menu extends Component {
    @property(Label)
    usernameLabel: Label = null;  // Hiển thị tên người chơi

    @property(Label)
    coinLabel: Label = null;  // Hiển thị số coin người chơi có

    @property(Node)
    lv1Button: Node = null; // lv1

    @property(Node)
    lv2Button: Node = null; // lv2

    @property(Node)
    leaderboardButton: Node = null; // Nút bảng xếp hạng

    @property(Node)
    bxhNode: Node = null;  // Bảng xếp hạng (hiển thị khi nhấn nút)

    @property(Node)
    backButton: Node = null;  // Nút "Back" trong bảng xếp hạng


    start() {
        // Lắng nghe sự kiện trả về từ WebSocket (login)
        WebSocketManager.getInstance().onGetUserInfoResponse = this.handleUserInfoResponse.bind(this);
        WebSocketManager.getInstance().onGetLeaderboardResponse = this.handleLeaderboardResponse.bind(this);
        WebSocketManager.getInstance().getUserInfo();

        // Đăng ký sự kiện cho các nút
        this.lv1Button.on('click', this.onLv1ButtonClick, this);
        this.lv2Button.on('click', this.onLv2ButtonClick, this);
        this.leaderboardButton.on('click', this.onLeaderboardButtonClick, this);
        this.backButton.on('click', this.onBackButtonClick, this); 

       
          // Lắng nghe sự kiện 'set-player-info' từ LoginManager
          this.node.on('set-player-info', this.setPlayerInfo, this);
    }

     // Xử lý sự kiện 'set-player-info' để cập nhật tên và điểm số
     private setPlayerInfo(playerInfo: any) {
        console.log("Player info received:", playerInfo);
        // Hiển thị tên và điểm số
        if (this.usernameLabel) {
            this.usernameLabel.string = "Username: " + playerInfo.username;
        }
        if (this.coinLabel) {
            this.coinLabel.string = "Score: " + playerInfo.score; // Giả sử bạn có trường 'score' trong thông tin người chơi
        }
    }

    /** Khi nhấn nút Back trong bảng xếp hạng */
    private onBackButtonClick() {
        console.log("Back button clicked");
        this.bxhNode.active = false;  // Ẩn bảng xếp hạng
    }

    /** Xử lý thông tin người chơi */
    private handleUserInfoResponse(response: any) {
        if (response.success) {
            this.usernameLabel.string = "Username: " + response.data.username;
            this.coinLabel.string = "Coins: " + response.data.coins;
        } else {
            console.error("Failed to get user info:", response.message);
        }
    }

    /** Xử lý bảng xếp hạng */
    private handleLeaderboardResponse(response: any) {
        if (response.success) {
            this.bxhNode.active = true;  // Hiện bảng xếp hạng
            console.log("Leaderboard:", response.leaderboard);
            // Hiển thị bảng xếp hạng hoặc làm gì đó với dữ liệu
        } else {
            console.error("Failed to get leaderboard:", response.message);
        }
    }
     // lv1
    private onLv1ButtonClick() {
        console.log("Play game button clicked");
        director.loadScene("Level1Scene");  // Chuyển sang game scene
    }

    // lv2
      private onLv2ButtonClick() {
        console.log("Play game button clicked");
        director.loadScene("Level2Scene");  // Chuyển sang game scene
    }

    /** Khi nhấn nút bảng xếp hạng */
    private onLeaderboardButtonClick() {
        console.log("Leaderboard button clicked");
        // Gửi yêu cầu lấy bảng xếp hạng
        //WebSocketManager.getInstance().getLeaderboard();
        this.bxhNode.active = true;
    }
}
