import { _decorator, Component, Node, EditBox, director, Label } from 'cc';
import { WebSocketManager } from '../socket/WebSocketManager';

const { ccclass, property } = _decorator;

@ccclass('RegisterManager')
export class RegisterManager extends Component {

    @property(EditBox)
    emailInput: EditBox | null = null;

    @property(EditBox)
    passwordInput: EditBox | null = null;

    @property(Label)
    errorMessageLabel: Label | null = null;

    /**
     * Gọi khi nhấn nút "Đăng ký"
     */
    public handleRegister() {
        if ( !this.emailInput || !this.passwordInput) {
            console.error("Input fields are not set in the editor!");
            return;
        }

        const email = this.emailInput.string.trim();
        const password = this.passwordInput.string.trim();

        // Kiểm tra thông tin nhập hợp lệ
        if ( !email || !password) {
            console.error("All fields are required!");
            if (this.errorMessageLabel) {
                this.errorMessageLabel.string = "All fields are required!";
            }
            return;
        }

        // Gửi yêu cầu đăng ký tới server qua WebSocketManager
        const registerMessage = {
            type: "REGISTER",
            data: { email, password },
        };

        const wsManager = WebSocketManager.getInstance();
        wsManager.sendMessage(registerMessage);

        console.log("Register message sent:", registerMessage);
    }

    /**
     * Xử lý phản hồi đăng ký từ WebSocketManager
     */
    public handleRegisterResponse() {
        director.loadScene("LoginScene");
        //     if (response.success) {
        //         console.log("Registration successful:", response);
        //         if (this.errorMessageLabel) {
        //             this.errorMessageLabel.string = "Registration successful!";
        //         }
        //         // Chuyển sang màn hình đăng nhập
        //         director.loadScene("LoginScene");
        //     } else {
        //         console.error("Registration failed:", response.message);
        //         if (this.errorMessageLabel) {
        //             this.errorMessageLabel.string = response.message;
        //         }
        //     }
        // }
    }

    public handlerLogin(){
        director.loadScene("LoginScene")
    }

    /**
     * Lắng nghe sự kiện từ WebSocketManager để nhận phản hồi từ server
     */
    onEnable() {
        const wsManager = WebSocketManager.getInstance();
        wsManager.onRegisterResponse = this.handleRegisterResponse.bind(this);  // Đăng ký hàm xử lý phản hồi
    }

    /**
     * Hủy bỏ sự kiện khi không còn cần thiết
     */
    onDisable() {
        const wsManager = WebSocketManager.getInstance();
        wsManager.onRegisterResponse = null;  // Xóa hàm xử lý phản hồi
    }
}
