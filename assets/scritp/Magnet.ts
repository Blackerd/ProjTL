import { _decorator, Component, Collider, Node, ITriggerEvent, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Magnet')
export class Magnet extends Component {
    @property(Node)
    player: Node | null = null; // Node của Player

    @property
    magnetEffectDuration: number = 10; // Thời gian hiệu ứng nam châm (giây)

    start() {
        const collider = this.getComponent(Collider);
        if (collider) {
            collider.on('onTriggerEnter', this.onMagnetCollected, this);
            collider.isTrigger = true;
        } else {
            console.warn(`${this.node.name} does not have a Collider component.`);
        }
    }

    private onMagnetCollected(event: ITriggerEvent) {
        const otherNode = event.otherCollider.node;

        if (this.player && otherNode === this.player) {
            console.log('Magnet collected! Activating magnet effect.');

            // Kích hoạt hiệu ứng nam châm
            this.player.emit('magnetActivated', this.magnetEffectDuration);

            // Xóa node nam châm
            this.node.destroy();
        }
    }
}
