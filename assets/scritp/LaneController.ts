import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('LaneController')
export class LaneController extends Component {
    @property({ type: Number })
    roadWidth: number = 30; // Độ rộng mặt đường, có thể chỉnh trong Cocos Editor

    @property({ type: Number })
    laneCount: number = 3; // Số lane, có thể chỉnh trong Cocos Editor

    private laneWidth: number = 0; // Chiều rộng mỗi lane
    private lanePositions: number[] = []; // Mảng lưu tọa độ X của các lane

    onLoad() {
        this.calculateLanes(); // Tính toán khi node được tải
    }

    // Tính toán các lane và lưu vào mảng
    private calculateLanes() {
        this.laneWidth = this.roadWidth / this.laneCount;

        this.lanePositions = [];
        for (let i = 0; i < this.laneCount; i++) {
            const position = -this.roadWidth / 2 + this.laneWidth * (i + 0.5); // Tọa độ giữa mỗi lane
            this.lanePositions.push(position);
        }
    }

    // Lấy vị trí X của lane theo chỉ số (0-based)
    getLanePosition(laneIndex: number): number {
        if (laneIndex < 0 || laneIndex >= this.lanePositions.length) {
            throw new Error('Lane index out of bounds');
        }
        return this.lanePositions[laneIndex];
    }

    // Số lượng lane
    getLaneCount(): number {
        return this.laneCount;
    }

    // Debug: In ra các lane
    logLanePositions() {
        console.log('Lane Positions:', this.lanePositions);
    }
}
