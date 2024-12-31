import { _decorator, Component, EditBox, Button, Label, ScrollView, Prefab, instantiate, systemEvent, Node } from 'cc';
import { WebSocketManager } from './WebSocketManager';
const { ccclass, property } = _decorator;

@ccclass('AdminSceneController')
export class AdminSceneController extends Component {
    // ======= Các nút trong thanh bên trái =======
    @property(Button)
    blockUserButton: Button = null;

    @property(Button)
    unblockUserButton: Button = null;

    @property(Button)
    getAllUsersButton: Button = null;

    @property(Button)
    getLeaderBoardsButton: Button = null;

    // ======= Các panel trong khu vực bên phải =======
    @property(Node)
    blockUserPanel: Node = null;

    @property(Node)
    unblockUserPanel: Node = null;

    @property(Node)
    getAllUsersPanel: Node = null;

    @property(Node)
    leaderBoardsPanel: Node = null;

    // ======= Các trường nhập liệu và nhãn trạng thái =======
    @property(EditBox)
    blockUserInput: EditBox = null;

    @property(Label)
    blockUserStatusLabel: Label = null;

    @property(EditBox)
    unblockUserInput: EditBox = null;

    @property(Label)
    unblockUserStatusLabel: Label = null;

    @property(EditBox)
    getAllUsersPageNoInput: EditBox = null;

    @property(EditBox)
    getAllUsersPageSizeInput: EditBox = null;

    @property(Label)
    getAllUsersStatusLabel: Label = null;

    @property(Label)
    leaderBoardsStatusLabel: Label = null;

    // ======= ScrollViews =======
    @property(ScrollView)
    allUsersScrollView: ScrollView = null;

    @property(ScrollView)
    leaderBoardsScrollView: ScrollView = null;

    // ======= Prefabs =======
    @property(Prefab)
    userItemPrefab: Prefab = null;

    @property(Prefab)
    leaderBoardItemPrefab: Prefab = null;

    start() {
        // Kết nối WebSocket
        WebSocketManager.getInstance().connectToServer();

        // Đăng ký sự kiện cho các nút
        this.blockUserButton.node.on(Button.EventType.CLICK, this.onBlockUser, this);
        this.unblockUserButton.node.on(Button.EventType.CLICK, this.onUnblockUser, this);
        this.getAllUsersButton.node.on(Button.EventType.CLICK, this.onGetAllUsers, this);
        this.getLeaderBoardsButton.node.on(Button.EventType.CLICK, this.onGetLeaderBoards, this);

        // Ẩn tất cả các panel khi bắt đầu
        this.hideAllPanels();

        // Lắng nghe các sự kiện từ WebSocketManager cho các chức năng admin
        systemEvent.on("blockUser" as any, this.onBlockUserResponse, this);
        systemEvent.on("unblockUser" as any, this.onUnblockUserResponse, this);
        systemEvent.on("getAllUsers" as any, this.onGetAllUsersResponse, this);
        systemEvent.on("getAllLeaderBoards" as any, this.onGetLeaderBoardsResponse, this);
    }

    onDestroy() {
        // Loại bỏ lắng nghe sự kiện khi destroy
        systemEvent.off("blockUser" as any, this.onBlockUserResponse, this);
        systemEvent.off("unblockUser" as any, this.onUnblockUserResponse, this);
        systemEvent.off("getAllUsers" as any, this.onGetAllUsersResponse, this);
        systemEvent.off("getAllLeaderBoards" as any, this.onGetLeaderBoardsResponse, this);
    }

    // ======= Các phương thức quản lý panel =======

    /**
     * Ẩn tất cả các panel.
     */
    private hideAllPanels() {
        this.blockUserPanel.active = false;
        this.unblockUserPanel.active = false;
        this.getAllUsersPanel.active = false;
        this.leaderBoardsPanel.active = false;
    }

    /**
     * Hiển thị panel cụ thể và ẩn các panel khác.
     * @param panel Node của panel cần hiển thị.
     */
    private showPanel(panel: Node) {
        this.hideAllPanels();
        panel.active = true;
    }

    // ======= Các phương thức xử lý nút =======

    /**
     * Xử lý khi nhấn nút Block User.
     */
    private onBlockUser() {
        const userId = this.blockUserInput.string.trim();
        if (!userId) {
            this.blockUserStatusLabel.string = "Lỗi: ID người dùng không được để trống.";
            return;
        }

        // Gửi yêu cầu chặn người dùng
        WebSocketManager.getInstance().blockUser(userId);

        // Cập nhật UI
        this.blockUserStatusLabel.string = "Đang chặn người dùng...";
        this.showPanel(this.blockUserPanel);
    }

    /**
     * Xử lý khi nhấn nút Unblock User.
     */
    private onUnblockUser() {
        const userId = this.unblockUserInput.string.trim();
        if (!userId) {
            this.unblockUserStatusLabel.string = "Lỗi: ID người dùng không được để trống.";
            return;
        }

        // Gửi yêu cầu mở chặn người dùng
        WebSocketManager.getInstance().unblockUser(userId);

        // Cập nhật UI
        this.unblockUserStatusLabel.string = "Đang mở chặn người dùng...";
        this.showPanel(this.unblockUserPanel);
    }

    /**
     * Xử lý khi nhấn nút Get All Users.
     */
    private onGetAllUsers() {
        const pageNo = parseInt(this.getAllUsersPageNoInput.string.trim()) || 1;
        const pageSize = parseInt(this.getAllUsersPageSizeInput.string.trim()) || 10;

        if (pageNo <= 0 || pageSize <= 0) {
            this.getAllUsersStatusLabel.string = "Lỗi: Số trang và kích thước trang phải là số nguyên dương.";
            return;
        }

        // Gửi yêu cầu lấy tất cả người dùng với phân trang
        WebSocketManager.getInstance().getAllUsers(pageNo, pageSize);

        // Cập nhật UI
        this.getAllUsersStatusLabel.string = "Đang lấy danh sách người dùng...";
        this.allUsersScrollView.content.removeAllChildren(); // Xóa danh sách cũ
        this.showPanel(this.getAllUsersPanel);
    }

    /**
     * Xử lý khi nhấn nút Get LeaderBoards.
     */
    private onGetLeaderBoards() {
        // Gửi yêu cầu lấy bảng xếp hạng
        WebSocketManager.getInstance().getAllLeaderBoards();

        // Cập nhật UI
        this.leaderBoardsStatusLabel.string = "Đang lấy bảng xếp hạng...";
        this.leaderBoardsScrollView.content.removeAllChildren(); // Xóa danh sách cũ
        this.showPanel(this.leaderBoardsPanel);
    }

    // ======= Các phương thức xử lý phản hồi từ server =======

    /**
     * Xử lý phản hồi từ server cho chức năng Block User.
     * @param message Phản hồi từ server.
     */
    private onBlockUserResponse(message: any) {
        if (message.success) {
            this.blockUserStatusLabel.string = "Chặn người dùng thành công.";
        } else {
            this.blockUserStatusLabel.string = `Lỗi: ${message.message}`;
        }
    }

    /**
     * Xử lý phản hồi từ server cho chức năng Unblock User.
     * @param message Phản hồi từ server.
     */
    private onUnblockUserResponse(message: any) {
        if (message.success) {
            this.unblockUserStatusLabel.string = "Mở chặn người dùng thành công.";
        } else {
            this.unblockUserStatusLabel.string = `Lỗi: ${message.message}`;
        }
    }

    /**
     * Xử lý phản hồi từ server cho chức năng Get All Users.
     * @param message Phản hồi từ server.
     */
    private onGetAllUsersResponse(message: any) {
        if (message.success && message.data) {
            const content = this.allUsersScrollView.content;
            content.removeAllChildren();

            // Duyệt qua danh sách người dùng và tạo các item từ prefab
            message.data.content.forEach((user: any) => {
                const userItem = instantiate(this.userItemPrefab);
                const label = userItem.getComponent(Label);
                if (label) {
                    label.string = `ID: ${user.id} | Email: ${user.email} | Trạng thái: ${user.status}`;
                }
                content.addChild(userItem);
            });

            // Cập nhật thông tin phân trang nếu cần
            this.getAllUsersStatusLabel.string = `Trang ${message.data.pageNo} / ${message.data.totalPages}`;
        } else {
            this.allUsersScrollView.content.removeAllChildren();
            const errorItem = instantiate(this.userItemPrefab);
            const label = errorItem.getComponent(Label);
            if (label) {
                label.string = `Lỗi: ${message.message}`;
            }
            this.allUsersScrollView.content.addChild(errorItem);
            this.getAllUsersStatusLabel.string = "Không thể lấy danh sách người dùng.";
        }
    }

    /**
     * Xử lý phản hồi từ server cho chức năng Get LeaderBoards.
     * @param message Phản hồi từ server.
     */
    private onGetLeaderBoardsResponse(message: any) {
        if (message.success && message.data) {
            const content = this.leaderBoardsScrollView.content;
            content.removeAllChildren();

            // Duyệt qua danh sách bảng xếp hạng và tạo các item từ prefab
            message.data.forEach((player: any, index: number) => {
                const leaderBoardItem = instantiate(this.leaderBoardItemPrefab);
                const label = leaderBoardItem.getComponent(Label);
                if (label) {
                    label.string = `${index + 1}. ${player.email} - Điểm: ${player.score}`;
                }
                content.addChild(leaderBoardItem);
            });

            this.leaderBoardsStatusLabel.string = "Đã cập nhật bảng xếp hạng.";
        } else {
            this.leaderBoardsScrollView.content.removeAllChildren();
            const errorItem = instantiate(this.leaderBoardItemPrefab);
            const label = errorItem.getComponent(Label);
            if (label) {
                label.string = `Lỗi: ${message.message}`;
            }
            this.leaderBoardsScrollView.content.addChild(errorItem);
            this.leaderBoardsStatusLabel.string = "Không thể lấy bảng xếp hạng.";
        }
    }
}
