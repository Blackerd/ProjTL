import { IAnimation } from './IAnimation';
import { Character } from './Character';
import { _decorator, Component } from 'cc';


const { ccclass, property } = _decorator;

@ccclass('Animation')
export class Animation extends Component  implements IAnimation {
    @property(Character)
    private character: Character;

    constructor(character: Character) {
        super();
        this.character = character;
    }


    playSlideAnimation(): void {
        if (this.character.skeletalAnimation && !this.character.skeletalAnimation.getState('default').isPlaying) {
            this.character.skeletalAnimation.stop();
            this.character.skeletalAnimation.play('default');
        }
    }

    playJumpAnimation(): void {
        if (this.character.skeletalAnimation && !this.character.skeletalAnimation.getState('jump').isPlaying) {
            this.character.skeletalAnimation.stop();
            this.character.skeletalAnimation.play('jump');
        }
    }

    playFlipAnimation(): void {
        if (this.character.skeletalAnimation && !this.character.skeletalAnimation.getState('flip').isPlaying) {
            this.character.skeletalAnimation.stop();
            this.character.skeletalAnimation.play('flip');
        }
    }

    playLeftAnimation(): void {
        if (this.character.skeletalAnimation && !this.character.skeletalAnimation.getState('left').isPlaying) {
            this.character.skeletalAnimation.stop();
            this.character.skeletalAnimation.play('left');
        }
    }
}