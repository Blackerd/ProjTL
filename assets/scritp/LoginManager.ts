import { _decorator, Component, EditBox, Label, Button, director } from 'cc';
import { WebSocketManager } from './WebSocketManager';

const { ccclass, property } = _decorator;

@ccclass('LoginManager')
export class LoginManager extends Component {
    @property(EditBox) 
    usernameInput: EditBox = null;

    @property(EditBox) 
    passwordInput: EditBox = null;

    @property(Button) 
    loginButton: Button = null;

    @property(Label) 
    errorMessageLabel: Label = null;

    start() {
        if (this.loginButton) {
            this.loginButton.node.on(Button.EventType.CLICK, this.onLogin, this);
        }
    }

    onLogin() {
        const username = this.usernameInput.string.trim();
        const password = this.passwordInput.string.trim();

        // Reset lỗi trước khi kiểm tra
        this.clearErrors();

        if (!username || !password) {
            this.showFieldError('Username and Password are required');
            return;
        }

        const loginMessage = {
            type: "LOGIN",
            data: { username, password },
        };

        const wsManager = WebSocketManager.getInstance();
        wsManager.sendMessage(loginMessage);

        console.log("Login message sent:", loginMessage);
    }

    public handleLoginResponse(response: any) {
        if (response.success) {
            console.log("Login successful:", response);
            director.loadScene("GameScene");
        } else {
            console.error("Login failed:", response.message);
            this.showFieldError(response.message);
        }
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