// Menu.ts
import { _decorator, Component, Node, director, Label, Button, Color, Prefab, instantiate, AudioSource } from 'cc';
import { WebSocketManager } from '../socket/WebSocketManager';
const { ccclass, property } = _decorator;

@ccclass('Menu')
export class Menu extends Component {
    @property(Label)
    usernameLabel: Label = null;  // Hiển thị tên người chơi

    // @property(Label)
    // coinLabel: Label = null;  // Hiển thị số coin người chơi có

    @property(Button)
    lv1Button: Button = null; // lv1

    @property(Button)
    lv2Button: Button = null; // lv2

    @property(Button)
    lv3Button: Button = null; // lv3

    @property(Button)
    infor: Button = null; // infor

    @property(Button)
    logout: Button = null; // logout

    @property(AudioSource)
    music: AudioSource = null; 

    @property(AudioSource)
    clickMusic: AudioSource = null; 

    @property(Button)
    rank: Button = null; // rank

    @property(Button)
    leaderboardButton: Button = null; // Nút bảng xếp hạng

    @property(Node)
    bxhNode: Node = null;  // Bảng xếp hạng (hiển thị khi nhấn nút)

    @property(Node)
    viewInforNode: Node = null; 

    @property(Node)
    viewRankNode: Node = null; // Node để hiển thị View Rank panel

    start() {
        // Đăng ký các callback từ WebSocketManager
        const wsManager = WebSocketManager.getInstance();
        // wsManager.onGetUserInfoResponse = this.handleUserInfoResponse.bind(this);
        // wsManager.onGetLeaderboardResponse = this.handleLeaderboardResponse.bind(this);
        // wsManager.onViewRankResponse = this.handleViewRankResponse.bind(this);

        // Gửi yêu cầu lấy thông tin người dùng
        wsManager.getUserInfo();

        this.clickMusic.stop();

        // Đăng ký sự kiện cho các nút
        this.lv1Button.node.on(Button.EventType.CLICK, this.onLv1ButtonClick, this);
        this.lv2Button.node.on(Button.EventType.CLICK, this.onLv2ButtonClick, this);
        this.lv3Button.node.on(Button.EventType.CLICK, this.onLv3ButtonClick, this);
        this.leaderboardButton.node.on(Button.EventType.CLICK, this.handleLeaderboard, this);
        this.rank.node.on(Button.EventType.CLICK, this.handleViewRank, this);
        this.infor.node.on(Button.EventType.CLICK, this.handleUserInfo, this);
        this.logout.node.on(Button.EventType.CLICK, this.handleLogout, this);
        

        // Ẩn các panel khi bắt đầu
        this.bxhNode.active = false;
        this.viewRankNode.active = false;
    }

    // /**
    //  * Xử lý khi nhận phản hồi thông tin người dùng từ server.
    //  * @param response Phản hồi từ server.
    //  */
    // private handleUserInfoResponse(response: any) {
    //     if (response.status === "success" && response.data) {
    //         this.usernameLabel.string = "Username: " + response.data.email; // Hoặc trường nào bạn muốn hiển thị
    //         this.coinLabel.string = "Coins: " + response.data.status; // Sửa lại theo dữ liệu thực tế

    //         // Cập nhật trạng thái
    //         this.userInfoStatusLabel.string = "Đã lấy thông tin người dùng.";
    //         this.userInfoStatusLabel.color = new Color(0, 255, 0); // Màu xanh lá
    //     } else {
    //         // Xử lý lỗi
    //         const errorMessage = response.message || "Không thể lấy thông tin người dùng.";
    //         this.userInfoStatusLabel.string = `Lỗi: ${errorMessage}`;
    //         this.userInfoStatusLabel.color = new Color(255, 0, 0); // Màu đỏ
    //     }
    // }

    /**
     * Xử lý khi nhận phản hồi bảng xếp hạng từ server.
     * @param response Phản hồi từ server.
     */
    // private handleLeaderboardResponse(response: any) {
    //     if (response.status === "success" && Array.isArray(response.data)) {
    //         this.bxhNode.active = true;  // Hiện bảng xếp hạng
    //         // this.leaderboardStatusLabel.string = "Đã lấy bảng xếp hạng.";
    //         // this.leaderboardStatusLabel.color = new Color(0, 255, 0); // Màu xanh lá

    //         // Xóa nội dung cũ
    //       //  this.leaderboardContent.removeAllChildren();

    //         // Thêm header cho bảng xếp hạng
    //         //const headerItem = instantiate(this.leaderboardItemPrefab);
    //        // const headerLabel = headerItem.getComponent(Label);
    //         if (headerLabel) {
    //             headerLabel.string = `Rank | Email                  | Score`;
    //             headerLabel.color = new Color(255, 255, 255); // Màu trắng
    //             headerLabel.fontSize = 14;
    //             headerLabel.enableWrapText = false;
    //         }
    //      //   this.leaderboardContent.addChild(headerItem);

    //         // Tạo các mục cho bảng xếp hạng
    //         response.data.forEach((player: any) => {
    //             const leaderboardItem = instantiate(this.leaderboardItemPrefab);
    //             const label = leaderboardItem.getComponent(Label);
    //             if (label) {
    //                 label.string = `${player.rank}    | ${player.email.padEnd(25)} | ${player.score}`;
    //                 label.color = new Color(255, 255, 255); // Màu trắng
    //             }
    //           //  this.leaderboardContent.addChild(leaderboardItem);
    //         });
    //     } else {
    //         // Xử lý lỗi
    //         const errorMessage = response.message || "Không thể lấy bảng xếp hạng.";
    //         this.leaderboardStatusLabel.string = `Lỗi: ${errorMessage}`;
    //         this.leaderboardStatusLabel.color = new Color(255, 0, 0); // Màu đỏ

    //         // Xóa nội dung cũ và hiển thị lỗi
    //       //  this.leaderboardContent.removeAllChildren();
    //         const errorItem = instantiate(this.leaderboardItemPrefab);
    //         const label = errorItem.getComponent(Label);
    //         if (label) {
    //             label.string = `Lỗi: ${errorMessage}`;
    //             label.color = new Color(255, 0, 0); // Màu đỏ
    //         }
    //       //  this.leaderboardContent.addChild(errorItem);
    //     }
    // }

    // /**
    //  * Xử lý khi nhận phản hồi View Rank từ server.
    //  * @param response Phản hồi từ server.
    //  */
    // private handleViewRankResponse(response: any) {
    //     if (response.status === "success" && response.data) {
    //         this.viewRankNode.active = true;  // Hiện panel View Rank

    //         // this.rankLabel.string = `Rank: ${response.data.rank}`;
    //         // this.rankUserIdLabel.string = `User ID: ${response.data.userId}`;
    //         // this.rankEmailLabel.string = `Email: ${response.data.email}`;
    //         // this.rankScoreLabel.string = `Score: ${response.data.score}`;

    //         // Cập nhật trạng thái
    //         this.viewRankStatusLabel.string = "Đã lấy vị trí của bạn.";
    //         this.viewRankStatusLabel.color = new Color(0, 255, 0); // Màu xanh lá
    //     } else {
    //         // Xử lý lỗi
    //         const errorMessage = response.message || "Không thể lấy vị trí của bạn.";
    //         this.viewRankStatusLabel.string = `Lỗi: ${errorMessage}`;
    //         this.viewRankStatusLabel.color = new Color(255, 0, 0); // Màu đỏ
    //     }
    // }

    /** Xử lý khi nhấn nút Back trong View Rank Panel */
    private onBackFromViewRank() {
        this.viewRankNode.active = true; // Ẩn panel View Rank
        this.bxhNode.active = false; // Hiện bảng xếp hạng
    }

    /** Xử lý khi nhấn nút Level 1 */
    private onLv1ButtonClick() {
        console.log("Level 1 button clicked");
        director.loadScene("Level1Scene");  // Chuyển sang Level1Scene
        this.clickMusic.play();
    }

    /** Xử lý khi nhấn nút Level 2 */
    private onLv2ButtonClick() {
        console.log("Level 2 button clicked");
        director.loadScene("Level2Scene");  // Chuyển sang Level2Scene
        this.clickMusic.play();
    }
     /** Xử lý khi nhấn nút Level 2 */
     private onLv3ButtonClick() {
        console.log("Level 3 button clicked");
         director.loadScene("Level3Scene");  // Chuyển sang Level2Scene
         this.clickMusic.play();
    }

    /** Khi nhấn nút bảng xếp hạng */
    private handleLeaderboard() {
        console.log("Leaderboard button clicked");
        // Gửi yêu cầu lấy bảng xếp hạng
        // WebSocketManager.getInstance().getLeaderboard();
        this.bxhNode.active = true;  // Hiện bảng xếp hạng
        this.viewRankNode.active = false; // Ẩn panel View Rank
        this.viewInforNode.active = false;
        this.clickMusic.play();
    }

    /** Khi nhấn nút View Rank */
    private handleViewRank() {
        console.log("View Rank button clicked");
        // Gửi yêu cầu lấy vị trí của người chơi
        // WebSocketManager.getInstance().getViewRank();
        this.viewRankNode.active = true;  // Hiện panel View Rank
        this.bxhNode.active = false; // Ẩn bảng xếp hạng
        this.viewInforNode.active = false;
        this.clickMusic.play();
    }

    /** Khi nhấn nút User Info */
    private handleUserInfo() {
        console.log("User Info button clicked");
        // Gửi yêu cầu lấy thông tin người chơi
        // WebSocketManager.getInstance().getUserInfo();
        this.viewInforNode.active = true;  // Hiện panel View Rank
        this.bxhNode.active = false; // Ẩn bảng xếp hạng
        this.viewRankNode.active = false;
        this.clickMusic.play();
    }

    public handleLogout() {
        console.log("Logout button clicked");
        // Gửi yêu cầu lấy thông tin người chơi
        // WebSocketManager.getInstance().getUserInfo();
        this.viewInforNode.active = false;  // Hiện panel View Rank
        this.bxhNode.active = false; // Ẩn bảng xếp hạng
        this.viewRankNode.active = false;
        director.loadScene("LoginScene");
        this.clickMusic.play();
    }


}
