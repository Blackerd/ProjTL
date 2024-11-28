import { _decorator, Component, EditBox, director, Color, Sprite, Label, Button } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('LoginManager')
export class LoginManager extends Component {
    @property(EditBox) usernameInput: EditBox = null; // Ô nhập username
    @property(EditBox) passwordInput: EditBox = null; // Ô nhập password
    @property(Button) loginButton: Button = null; // Nút Login
    @property(Button) registerButton: Button = null; // Nút Register

    start() {
        // Gắn sự kiện khi nhấn nút Login
        if (this.loginButton) {
            this.loginButton.node.on(Button.EventType.CLICK, this.onLogin, this);
        }

        console.log("Register button setup");
        // Gắn sự kiện khi nhấn nút Register
        if (this.registerButton) {
            this.registerButton.node.on(Button.EventType.CLICK, this.onRegister, this);
        }
    }

    async onLogin() {
        const username = this.usernameInput.string.trim();
        const password = this.passwordInput.string.trim();

        // Reset lỗi trước khi kiểm tra
        this.clearErrors();

        let hasError = false;

        // Kiểm tra lỗi đầu vào từ phía client
        if (!username) {
            this.showFieldError(this.usernameInput, 'Username cannot be empty!');
            hasError = true;
        }

        if (!password) {
            this.showFieldError(this.passwordInput, 'Password cannot be empty!');
            hasError = true;
        }

        if (hasError) {
            return; // Không gửi yêu cầu nếu có lỗi
        }

        try {
            // Gửi yêu cầu tới API server
            const response = await fetch('https://your-api-server.com/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                throw new Error('Failed to connect to server');
            }

            const data = await response.json();

            // Xử lý phản hồi từ server
            if (data.success) {
                console.log('Login successful!');
                // Chuyển đến GameScene nếu đăng nhập thành công
                setTimeout(() => {
                director.loadScene('GameScene'); // Đảm bảo tên Scene là 'gameScene' trong project
            }, 100);
            } else {
                // Hiển thị lỗi từ server
                if (data.errorCode === 'INVALID_USERNAME') {
                    this.showFieldError(this.usernameInput, 'Incorrect username!');
                } else if (data.errorCode === 'INVALID_PASSWORD') {
                    this.showFieldError(this.passwordInput, 'Incorrect password!');
                } else {
                    this.showFieldError(this.usernameInput, data.message || 'Unknown error occurred!');
                    console.error('Unknown error:', data.message);
                }
            }
        } catch (error) {
            console.error('Error during login:', error);
            this.showFieldError(this.usernameInput, 'Unable to connect to the server!');
        }
    }

    onRegister() {
        console.log('Register button clicked');
        setTimeout(() => {
            director.loadScene('RegisterScene');
        }, 100);  // Trì hoãn 100ms
    }

    /**
     * Hiển thị lỗi trực tiếp trên ô nhập
     * @param inputField Trường nhập (EditBox)
     * @param message Thông báo lỗi
     */
    private showFieldError(inputField: EditBox, message: string) {
        const placeholderLabel = inputField.node.getChildByName('PLACEHOLDER');
        if (placeholderLabel) {
            const labelComponent = placeholderLabel.getComponent(Label);
            if (labelComponent) {
                labelComponent.string = message; // Cập nhật thông báo lỗi
                labelComponent.color = new Color(255, 0, 0); // Đổi màu placeholder thành đỏ
            }
        }

        const editBoxBackground = inputField.node.getChildByName('Background');
        if (editBoxBackground) {
            const sprite = editBoxBackground.getComponent(Sprite);
            if (sprite) {
                sprite.color = new Color(255, 200, 200); // Đổi màu nền thành hồng nhạt
            }
        }
    }

    /**
     * Ẩn lỗi và reset trạng thái placeholder
     */
    private clearErrors() {
        this.resetField(this.usernameInput, 'Enter your username');
        this.resetField(this.passwordInput, 'Enter your password');
    }

    /**
     * Reset trạng thái của một ô nhập
     * @param inputField Trường nhập (EditBox)
     * @param defaultPlaceholder Nội dung mặc định của placeholder
     */
    private resetField(inputField: EditBox, defaultPlaceholder: string) {
        const placeholderLabel = inputField.node.getChildByName('PLACEHOLDER');
        if (placeholderLabel) {
            const labelComponent = placeholderLabel.getComponent(Label);
            if (labelComponent) {
                labelComponent.string = defaultPlaceholder; // Cập nhật placeholder mặc định
                labelComponent.color = new Color(200, 200, 200); // Đổi màu placeholder mặc định
            }
        }

        const editBoxBackground = inputField.node.getChildByName('Background');
        if (editBoxBackground) {
            const sprite = editBoxBackground.getComponent(Sprite);
            if (sprite) {
                sprite.color = new Color(255, 255, 255); // Đổi lại màu nền mặc định
            }
        }
    }
}
