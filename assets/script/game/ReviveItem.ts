import { _decorator, Component, Collider, Node, ITriggerEvent } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('ReviveItem')
export class ReviveItem extends Component {
    @property(Node)
    player: Node | null = null;

    start() {
        const collider = this.getComponent(Collider);
        if (collider) {
            collider.on('onTriggerEnter', this.onReviveCollected, this);
            collider.isTrigger = true;
        } else {
            console.warn(`${this.node.name} does not have a Collider component.`);
        }
    }

    private onReviveCollected(event: ITriggerEvent) {
        const otherNode = event.otherCollider.node;

        if (this.player && otherNode === this.player) {
            console.log('Revive item collected! Player can now revive once.');
            this.player.emit('reviveActivated'); // Kích hoạt trạng thái hồi sinh
            this.node.active = false; // Ẩn vật phẩm (không xóa)
        }
    }
}
