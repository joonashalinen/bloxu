import { Animation as BJSAnimation } from "@babylonjs/core";
import Animation from "./Animation";

/**
 * Constructors for commonly useful general types of animations.
 */
export default class AnimationFactory {
    private _runningId = 0;

    constructor() {
        
    }

    /**
     * An animation that linearly transitions from a float value to another.
     */
    linearFade(property: string, from: number, to: number) {
        const animation = new BJSAnimation(
            "ColorAnimationFactory::" + (this._runningId++), property, 60,
            BJSAnimation.ANIMATIONTYPE_FLOAT, BJSAnimation.ANIMATIONLOOPMODE_CYCLE
        );
        animation.setKeys([{frame: 0, value: from}, {frame: 60, value: to}]);
        return new Animation(animation);
    }
}