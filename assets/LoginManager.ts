import { _decorator, Component, EditBox, Label, director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('LoginManager')
export class LoginManager extends Component {
    @property(EditBox) usernameInput: EditBox = null;
    @property(EditBox) passwordInput: EditBox = null;
    @property(Label) errorMessage: Label = null;

    onLogin() {
        const username = this.usernameInput.string.trim();
        const password = this.passwordInput.string.trim();

        // Giả lập xử lý login (thay bằng API thật nếu có server)
        if (username === 'user' && password === '1234') {
            console.log('Login successful!');
            director.loadScene('gameScene'); // Chuyển đến GameScene
        } else {
            this.errorMessage.string = 'Invalid username or password!';
            this.errorMessage.node.active = true; // Hiển thị thông báo lỗi
        }
    }

    onRegister() {
        director.loadScene('RegisterScene'); // Chuyển đến RegisterScene
    }
}
