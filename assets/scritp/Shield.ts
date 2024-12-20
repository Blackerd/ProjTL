import { _decorator, Component, Collider, Node, ITriggerEvent } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Shield')
export class Shield extends Component {
    @property(Node)
    player: Node | null = null; // Node của nhân vật

    start() {
        const collider = this.getComponent(Collider);
        if (collider) {
            collider.on('onTriggerEnter', this.onShieldHit, this);
            collider.isTrigger = true; // Đảm bảo collider là trigger
        } else {
            console.warn(`${this.node.name} does not have a Collider component.`);
        }
    }

    /**
     * Xử lý khi va chạm với Player.
     * @param event Sự kiện va chạm
     */
    private onShieldHit(event: ITriggerEvent) {
        const otherNode = event.otherCollider.node;

        if (this.player && otherNode === this.player) {
            console.log('Player picked up a shield!');
            // Phát sự kiện "shieldActivated" cho Player
            this.player.emit('shieldActivated');
            // Xóa node lá chắn
            this.node.destroy();
        }
    }
}
