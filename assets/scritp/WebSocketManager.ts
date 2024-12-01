import { _decorator, Component, director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('WebSocketManager')
export class WebSocketManager extends Component {
    private static instance: WebSocketManager | null = null;
    private socket: WebSocket | null = null;
    private serverUrl: string = "ws://localhost:8080/game"; // Địa chỉ WebSocket server
    private isConnected: boolean = false;

  // Hàm callback cho các phản hồi từ server
  public onRegisterResponse: (response: any) => void = () => {};
  public onLoginResponse: (response: any) => void = () => {};


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
    private connectToServer() {
        if (this.socket) return;

        console.log("Connecting to WebSocket server...");
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

    /**
     * Gửi tin nhắn tới server.
     * @param message Object tin nhắn cần gửi
     */
    public sendMessage(message: object) {
        if (this.isConnected && this.socket) {
            this.socket.send(JSON.stringify(message));
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
