import { TransformNode } from "@babylonjs/core";
import EventEmitter from "../../events/pub/EventEmitter";
import IEventable from "../../events/pub/IEventable";
import AnimatedRotatable from "./AnimatedRotatable";
import IAutoUpdatable from "./IAutoUpdatable";
import IMovable from "./IMovable";
import IObject from "./IObject";

/**
 * An object that is both movable and rotatable with animations.
 * Since the object has both types of animations, we want rotation 
 * animations to disable whenever the object moves.
 */
export default class AnimatedMovableRotatable implements IAutoUpdatable, IObject {
    emitter = new EventEmitter();
    autoUpdateEnabled: boolean = true;
    autoUpdateInitialized: boolean = false;
    transformNode: TransformNode;
    
    constructor(
        public movable: IMovable & IEventable, 
        public rotatable: AnimatedRotatable
    ) {
        this.transformNode = rotatable.transformNode;
    }

    enableAutoUpdate(): IAutoUpdatable {
        if (!this.autoUpdateInitialized) {
            this.movable.emitter.on("move", () => {
                if (this.autoUpdateEnabled) {
                    this.rotatable.disableAnimations();
                }
            });
    
            this.movable.emitter.on("moveEnd", () => {
                if (this.autoUpdateEnabled) {
                    this.rotatable.enableAnimations();
                }
            });
    
            this.autoUpdateInitialized = true;
        }
        this.autoUpdateEnabled = true;
        return this;
    }

    disableAutoUpdate() {
        this.autoUpdateEnabled = false;
        return this;
    }
}