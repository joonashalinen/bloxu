import { AnimationGroup } from "@babylonjs/core";

/**
 * An animation that can change itself on-the-fly based 
 * on input given to it. This class is meant to be a base class for 
 * classes that implement said input behaviors.
 */
export default class InteractiveAnimation {
    currentAnimation: AnimationGroup | undefined;
    private _enabled: boolean = true;

    constructor() {
        
    }

    /**
     * Whether the animation is enabled and will 
     * respond to updates.
     */
    enabled() {
        return this._enabled;
    }

    /**
     * Stops the current running animation and 
     * will no longer run this animation even when updated.
     */
    disable() {
        if (this._enabled) {
            if (this.currentAnimation !== undefined) {
                this.currentAnimation.stop();
            }
            this._enabled = false;
        }
    }

    /**
     * Continues playing the animation that 
     * was stopped when .disable() was called.
     * The animation will also now respond to 
     * updates.
     */
    enable(continueAnimation: boolean = true) {
        if (!this._enabled) {
            if (this.currentAnimation !== undefined && continueAnimation) {
                this.currentAnimation.play(true);
            }
            this._enabled = true;
        }
    }
}