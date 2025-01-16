import { _decorator, Component, director, error } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('WebSocketManager')
export class WebSocketManager extends Component {
    private static instance: WebSocketManager | null = null;
    private socket: WebSocket | null = null;
    private serverUrl: string = "ws://localhost:8080/game"; // Địa chỉ WebSocket server
     isConnected: boolean = false;

      // Thông tin người chơi
      public username: string = '';
      public coinCount: number = 0;

    // Hàm callback cho các phản hồi từ server
    public onRegisterResponse: (response: any) => void = () => {};
    public onLoginResponse: (response: any) => void = () => {};
    public onGetLeaderboardResponse: (response: any) => void = () => {};
    public onGetUserInfoResponse: (response: any) => void = () => {};
    public onViewRankResponse: (response: any) => void = () => {};
    public onSaveGameResultResponse: (response: any) => void = () => {};
  

    /**
     * Đảm bảo chỉ có một instance WebSocketManager được sử dụng.
     */
    public static getInstance(): WebSocketManager {
        if (!WebSocketManager.instance) {
            WebSocketManager.instance = new WebSocketManager();
        }
        return WebSocketManager.instance;
    }

    onLoad() {
        // Gắn WebSocketManager instance và đảm bảo không bị xóa khi load scene mới
        if (!WebSocketManager.instance) {
            WebSocketManager.instance = this;
            this.connectToServer();
        } else {
            this.destroy(); // Hủy bỏ các instance dư thừa
        }
    }

    /**
     * Kết nối tới WebSocket server.
     */
     connectToServer() {
        if (this.socket) return;

        console.log("Đang kết nối WebSocket server");
        this.socket = new WebSocket(this.serverUrl);

        // Xử lý sự kiện khi kết nối thành công
        this.socket.onopen = () => {
            console.log("Connected to WebSocket server.");
            this.isConnected = true;
            this.onConnectionEstablished();
        };

        // Xử lý sự kiện nhận tin nhắn từ server
        this.socket.onmessage = (event) => {
            console.log("Message received from server:", event.data);
            this.handleServerMessage(event.data);
        };

        // Xử lý sự kiện khi xảy ra lỗi kết nối
        this.socket.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        // Xử lý sự kiện khi kết nối bị đóng
        this.socket.onclose = () => {
            console.log("WebSocket connection closed. Retrying...");
            this.isConnected = false;
            this.retryConnection();
        };
    }

    /**
     * Thử kết nối lại server sau khi kết nối bị đóng.
     */
    private retryConnection() {
        setTimeout(() => {
            console.log("Retrying WebSocket connection...");
            this.connectToServer();
        }, 3000); // Đợi 3 giây trước khi thử kết nối lại
    }

     // Gửi yêu cầu đăng nhập
     public login(email: string, password: string) {
        const message = {
            type: "LOGIN",
            email: email,
            password: password
        };
        this.sendMessage(message);
    }

     // Gửi yêu cầu đăng ký
     public register( email: string, password: string) {
        const registerMessage = {
            type: "REGISTER",
            data: { email, password },
        };
        this.sendMessage(registerMessage);
    }

        // Gửi yêu cầu lấy bảng xếp hạng
        public getLeaderboard() {
            const message = { type: "GET_LEADERBOARD" };
            this.sendMessage(message);
        }
    
         // Gửi yêu cầu lấy thông tin người chơi (username và coin)
         public getUserInfo() {
            const request = {
                type: "GET_USER_INFO",
                data: {},
            };
            this.sendMessage(request);
        }

          // Gửi yêu cầu lấy thống kê hệ thống
    public getSystemStats() {
        const message = { type: "getSystemStats" };
        this.sendMessage(message);
    }
    // ======= Các phương thức gửi yêu cầu admin =======

    /**
     * Chặn người dùng.
     * @param userId ID của người dùng cần chặn.
     */
    public blockUser(userId: string) {
        const message = {
            action: "blockUser",
            userId: userId
        };
        this.sendMessage(message);
    }
  

     /**
     * Mở chặn người dùng.
     * @param userId ID của người dùng cần mở chặn.
     */
     public unblockUser(userId: string) {
        const message = {
            action: "unblockUser",
            userId: userId
        };
        this.sendMessage(message);
    }

      /**
     * Lấy danh sách tất cả người dùng với phân trang.
     * @param pageNo Số trang cần lấy.
     * @param pageSize Số lượng người dùng mỗi trang.
     */
      public getAllUsers(pageNo: number, pageSize: number) {
        const message = {
            action: "getAllUsers",
            pageNo: pageNo,
            pageSize: pageSize
        };
        this.sendMessage(message);
    }

     /**
     * Lấy bảng xếp hạng.
     */
     public getAllLeaderBoards() {
        const message = {
            action: "getAllLeaderBoards"
        };
        this.sendMessage(message);
    }

    // Gửi yêu cầu xem hạng người chơi
    public viewRank() {
        const message = { type: "viewRank" };
        this.sendMessage(message);
    }

     // Gửi yêu cầu lưu kết quả game
     public saveGameResult(score: number, duration: number) {
        const message = {
            action: "saveGameResult",
            score: score,
            duration: duration
        };
        this.sendMessage(message);
    }

    /**
     * Gửi tin nhắn tới server.
     * @param message Object tin nhắn cần gửi
     */
    public sendMessage(message: object) {
        if (this.isConnected && this.socket) {
            this.socket.send(JSON.stringify(message));
            console.log("Đã gửi tin nhắn tới server:", message);
        } else {
            console.error("Cannot send message, WebSocket not connected.");
        }
    }


    /**
     * Xử lý các tin nhắn từ server.
     * @param data Tin nhắn từ server dưới dạng chuỗi
     */
    private handleServerMessage(data: string) {
        const message = JSON.parse(data);

        if (!message.action) {
            console.warn("Received message without action:", message);
            return;
        }

        switch (message.type) {
            case "REGISTER_RESPONSE":
                if (this.onRegisterResponse) {
                    this.onRegisterResponse(message);
                }
                break;
       
            case "LOGIN_RESPONSE":
                if (this.onLoginResponse) {
                    this.onLoginResponse(message);
                }
                break;
            case "LEADERBOARD_RESPONSE":
                if (this.onGetLeaderboardResponse) {
                    this.onGetLeaderboardResponse(message);
                }
                break;
            case "USER_INFO_RESPONSE":
                if (this.onGetUserInfoResponse) {
                    this.onGetUserInfoResponse(message); // Gọi callback khi nhận được thông tin người chơi
                 }
                break;

            case "ERROR":
                console.error("Server error:", message.message);
                break;

            default:
                console.warn("Unhandled message type:", message.type);
        }
    }

    /**
     * Thực hiện logic khi kết nối thành công.
     */
    private onConnectionEstablished() {
        console.log("Connection established. Ready to send and receive messages.");
    }
}
