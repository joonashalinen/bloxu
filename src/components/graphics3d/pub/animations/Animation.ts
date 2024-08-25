import { AbstractMesh, Animation as BJSAnimation } from "@babylonjs/core";

export interface TAnimationOptions {
    speed?: number;
    keepFinalValue?: boolean;
}

/**
 * Wrapper for babylonjs Animations, providing 
 * a cleaner interface.
 */
export default class Animation {
    constructor(public animation: BJSAnimation, public options: TAnimationOptions = {}) {
        if (options.speed === undefined) options.speed = 1;
        if (options.keepFinalValue === undefined) options.keepFinalValue = false;
    }

    /**
     * Plays the given animation for the given mesh. 
     * Returns a Promise that resolves when the animation has finished playing.
     */
    play(mesh: AbstractMesh): Promise<void> {
        return new Promise((resolve) => {
            mesh.getScene().beginDirectAnimation(
                mesh, [this.animation], 0, 60, false, this.options.speed, () => {
                    if (this.options.keepFinalValue) {
                        const keys = this.animation.getKeys();
                        const finalValue = keys[keys.length - 1].value;
                        mesh[this.animation.targetProperty] = finalValue;
                    }
                    resolve();
            });
        });
    }
}