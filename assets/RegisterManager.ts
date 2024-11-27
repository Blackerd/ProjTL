import { _decorator, Component, EditBox, Label, director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('RegisterManager')
export class RegisterManager extends Component {
    @property(EditBox) usernameInput: EditBox = null;
    @property(EditBox) passwordInput: EditBox = null;
    @property(EditBox) confirmPasswordInput: EditBox = null;
    @property(Label) errorMessage: Label = null;

    onRegister() {
        const username = this.usernameInput.string.trim();
        const password = this.passwordInput.string.trim();
        const confirmPassword = this.confirmPasswordInput.string.trim();

        // Kiểm tra các điều kiện đăng ký
        if (password !== confirmPassword) {
            this.errorMessage.string = 'Passwords do not match!';
            this.errorMessage.node.active = true;
        } else if (username === '' || password === '') {
            this.errorMessage.string = 'All fields are required!';
            this.errorMessage.node.active = true;
        } else {
            console.log(`Registered successfully with username: ${username}`);
            director.loadScene('LoginScene'); // Quay lại LoginScene
        }
    }

    onBackToLogin() {
        director.loadScene('LoginScene'); // Quay lại LoginScene
    }
}
