import { AnimationGroup, TransformNode, Vector2, Vector3 } from "@babylonjs/core";
import IMovable from "./IMovable";
import DiscreteVector from "../../graphics3d/pub/DiscreteVector";
import IObject from "./IObject";
import EventEmitter from "../../events/pub/EventEmitter";
import IEventable from "../../events/pub/IEventable";

/**
 * A movable that has direction-specific movement animations.
 */
export default class AnimatedMovable implements IMovable, IObject, IEventable {
    currentAnimation: AnimationGroup | undefined;
    transformNode: TransformNode;
    animationsEnabled: boolean = true;
    movementEnabled: boolean = true;
    emitter: EventEmitter = new EventEmitter();

    public get direction(): Vector3 {
        return this.movable.direction;
    }
    public set direction(value: Vector3) {
        this.movable.direction = value;
    }

    constructor(
        public movable: IMovable & IObject, 
        public eventableMovable: IMovable & IEventable,
        public directions: Array<Vector2>, 
        public animations: Array<AnimationGroup>
    ) {
        this.transformNode = movable.transformNode;
        animations.forEach((animation) => {
            animation.enableBlending = true;
            animation.blendingSpeed = 0.2;
        });

        eventableMovable.emitter.on("moveEnd", (...args: unknown[]) => {
            this.emitter.trigger("moveEnd", args);
        });
    }

    move(direction: Vector3, onlyInDirection?: boolean | undefined): IMovable {
        // Currently we have only 2D movement along the x-z-plane implemented.
        const direction2D = new Vector2(direction.x, direction.z);
        const [discreteDirection, directionIndex] = (new DiscreteVector(this.directions)).round(direction2D);

        if (this.animationsEnabled) {
            const animation = this.animations[directionIndex];
            if (animation !== undefined && animation !== this.currentAnimation) {
                if (this.currentAnimation !== undefined) {
                    this.currentAnimation.stop();
                }
                animation.play(true);
                this.currentAnimation = animation;
            }
        }

        if (this.movementEnabled) {
            this.movable.move(direction);
        }

        return this;
    }

    /**
     * Enable playing animations when moving.
     */
    enableAnimations() {
        this.animationsEnabled = true;
    }

    /**
     * Disable playing animations when moving.
     */
    disableAnimations() {
        if (this.currentAnimation !== undefined) {
            this.currentAnimation.stop();
        }
        this.currentAnimation = undefined;
        this.animationsEnabled = false;
    }

    /**
     * Enable movements. Does not enable animations.
     */
    enableMovement() {
        this.movementEnabled = true;
    }

    /**
     * Disable movements. Does not disable animations.
     */
    disableMovement() {
        this.movementEnabled = false;
        this.movable.move(new Vector3(0, 0, 0));
    }
}