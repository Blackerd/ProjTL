import { _decorator, Component, EditBox, Label, Button, director } from 'cc';
import { WebSocketManager } from '../socket/WebSocketManager';

const { ccclass, property } = _decorator;

@ccclass('LoginManager')
export class LoginManager extends Component {
    @property(EditBox) 
    emailInput: EditBox = null;

    @property(EditBox) 
    passwordInput: EditBox = null;

    @property(Button) 
    loginButton: Button = null;

    @property(Label) 
    errorMessageLabel: Label = null;

    start() {
         // Kết nối tới WebSocket server
         const wsManager = WebSocketManager.getInstance();
         if (wsManager.isConnected) {
             console.log("WebSocket already connected.");
         } else {
             console.log("Không thể kết nối WebSocket");
         }
         
        // if (this.loginButton) {
        //     this.loginButton.node.on(Button.EventType.CLICK, this.onLogin, this);
        // }
    }

    onLogin() {
        const emailInput = this.emailInput.string.trim();
        const password = this.passwordInput.string.trim();

        // Reset lỗi trước khi kiểm tra
        this.clearErrors();

        if (!emailInput || !password) {
            this.showFieldError('emailInput and Password are required');
            return;
        }

        const loginMessage = {
            type: "LOGIN",
            data: { emailInput, password },
        };

        const wsManager = WebSocketManager.getInstance();
        wsManager.sendMessage(loginMessage);

        console.log("Login message sent:", loginMessage);
    }

    public handleLoginResponse() {
        const emailInput = this.emailInput.string.trim();
        if (emailInput == "admin@gmail.com") {
            director.loadScene("AdminScene");
        } else if (emailInput == "duong@gmail.com"){
            director.loadScene("MenuScene");
        }
        // if (response.success) {
        //     console.log("Login successful:", response);

        //     // Lưu thông tin người chơi vào director
        //     const playerInfo = response.playerInfo;
        //     if (playerInfo) {
        //         director.once('after-scenes-loaded', () => {
        //             // Chuyển đến MenuScene và truyền dữ liệu người chơi
        //             director.loadScene("MenuScene", () => {
        //                 // Truyền thông tin người chơi vào MenuScene
        //                 director.getScene().emit('set-player-info', playerInfo);
        //             });
        //         });
        //     } else {
        //         console.error("No player info received");
        //     }

        //     director.loadScene("MenuScene");
        // } else {
        //     console.error("Login failed:", response.message);
        //     this.showFieldError(response.message);
        // }
    }

    public handleRegister(){
        director.loadScene("RegisterScene");
    }

    onEnable() {
        const wsManager = WebSocketManager.getInstance();
        wsManager.onLoginResponse = this.handleLoginResponse.bind(this); // Đăng ký hàm xử lý phản hồi
    }

    onDisable() {
        const wsManager = WebSocketManager.getInstance();
        wsManager.onLoginResponse = null; // Xóa hàm xử lý phản hồi
    }

    private showFieldError(message: string) {
        if (this.errorMessageLabel) {
            this.errorMessageLabel.string = message;
        }
    }

    private clearErrors() {
        this.showFieldError("");
    }
}
