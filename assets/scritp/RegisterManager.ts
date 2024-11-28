import { _decorator, Component, EditBox, Label, director, Button, Color } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('RegisterManager')
export class RegisterManager extends Component {
    @property(EditBox) usernameInput: EditBox = null;
    @property(EditBox) passwordInput: EditBox = null;
    @property(EditBox) confirmPasswordInput: EditBox = null;
    @property(Label) errorMessage: Label = null;
    @property(Button) registerButton: Button = null;
    @property(Button) backButton: Button = null;

    start() {
        // Gắn sự kiện cho nút Register
        console.log("có nút đăng ký")
        if (this.registerButton) {
            this.registerButton.node.on(Button.EventType.CLICK, this.onRegister, this);
        }

        // Gắn sự kiện cho nút quay lại Login
        if (this.backButton) {
            this.backButton.node.on(Button.EventType.CLICK, this.onBackToLogin, this);
        }

        // Ẩn thông báo lỗi và thành công ban đầu
        this.errorMessage.node.active = false;
    }

    async onRegister() {
        const username = this.usernameInput.string.trim();
        const password = this.passwordInput.string.trim();
        const confirmPassword = this.confirmPasswordInput.string.trim();

        // Kiểm tra các điều kiện đăng ký
        if (password !== confirmPassword) {
            this.showError('Passwords do not match!');
        } else if (username === '' || password === '' || confirmPassword === '') {
            this.showError('All fields are required!');
        } else {
            try {
                // Gửi yêu cầu đăng ký tới API server
                const response = await fetch('https://your-api-server.com/api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password }),
                });

                if (!response.ok) {
                    throw new Error('Failed to connect to the server');
                }

                const data = await response.json();

                // Kiểm tra phản hồi từ server
                if (data.success) {
                    console.log("Đăng ký thành công")
                    director.loadScene('LoginScene'); // Quay lại LoginScene sau khi đăng ký thành công
                } else {
                    this.showError(data.message || 'Đăng ksy thất bại!');
                }
            } catch (error) {
                console.error('Error during registration:', error);
                this.showError('Unable to connect to the server!');
            }
        }
    }

    onBackToLogin() {
        setTimeout(() => {
            console.log("chuyển sang màn hình Login")
            director.loadScene('LoginScene');
        }, 100);  // Trì hoãn 100ms
    }

    /**
     * Hiển thị thông báo lỗi
     * @param message Thông báo lỗi
     */
    private showError(message: string) {
        this.errorMessage.string = message;
        this.errorMessage.node.active = true;
    }
  
}
