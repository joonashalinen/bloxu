import { AnimationGroup, Camera, Mesh, Node, Quaternion, Scene, TransformNode, Vector2 } from "@babylonjs/core";
import MeshLeash2D from "../../graphics3d/pub/MeshLeash2D";
import DMeshLeash2D from "../../graphics3d/pub/DMeshLeash2D";
import EventEmitter from "../../events/pub/EventEmitter";
import IObject from "./IObject";
import IRotatable from "./IRotatable";
import IAutoUpdatable, { isAutoUpdatable } from "./IAutoUpdatable";
import IEventable from "../../events/pub/IEventable";
import TimeAdjustedDifference from "../../statistics/pub/TimeAdjustedDifference";
import MovingAverage from "../../statistics/pub/MovingAverage";

/**
 * An IRotatable that has an animation associated with each 
 * rotation direction.
 */
export default class AnimatedRotatable implements IObject, IRotatable, IAutoUpdatable, IEventable {
    emitter = new EventEmitter();
    transformNode: TransformNode;
    
    autoUpdateEnabled: boolean = false;
    autoUpdateInitialized: boolean = false;
    
    angle: number;
    direction: Vector2;

    currentAnimation: AnimationGroup | undefined;
    animationsEnabled: boolean = true;
    rotationEnabled: boolean = true;
    originalAnimationSpeed: number;
    currentAnimationSpeed: number;
    turnAngleDifference = new TimeAdjustedDifference();
    turnAngleMovingAverage = new MovingAverage(300);

    constructor(
        public rotatable: IRotatable & IAutoUpdatable & IObject, 
        public animations: {left: AnimationGroup, right: AnimationGroup}
    ) {
        this.angle = rotatable.angle;
        this.direction = rotatable.direction;
        this.transformNode = rotatable.transformNode;

        // Enable animation blending.
        [animations.left, animations.right].map((animation) => {
            animation.enableBlending = true;
            animation.blendingSpeed = 0.2;
        });
        
        this.originalAnimationSpeed = animations.left.speedRatio;
        this.currentAnimationSpeed = animations.left.speedRatio;
    }

    enableAutoUpdate() {
        if (isAutoUpdatable(this.rotatable)) {
            if (!this.autoUpdateInitialized) {
                this.rotatable.emitter.on("rotate", () => {
                    if (this.autoUpdateEnabled) {
                        this.update();
                    }
                });
                this.autoUpdateInitialized = true;
            }
        }
        this.autoUpdateEnabled = true;
        return this;
    }

    disableAutoUpdate() {
        this.autoUpdateEnabled = false;
        return this;
    }

    /**
     * Update animations.
     */
    update() {
        if (this.rotatable.angle.toPrecision(3) === this.angle.toPrecision(3)) {return}

        // Determine turn direction.
        const direction = this.rotatable.angle < this.angle ? "left" : "right";

        // Determine turn speed.
        // Adjust the difference based on the passed time between updates.
        this.turnAngleDifference.observe(this.rotatable.angle, Date.now());
        const timeAdjustedAngleDifference = Math.abs(this.turnAngleDifference.get());

        // Average the last N turn observations.
        const averagedAngleDifference = this.turnAngleMovingAverage
                                                                    .observe(timeAdjustedAngleDifference).get();

        // 80 is a magic number found via trial and error for making the turn animation look correct.
        const newAnimationSpeed = this.originalAnimationSpeed * averagedAngleDifference * 80;

        const animation = this.animations[direction];

        if (this.rotationEnabled) {
            // If there is not enough of a different in the turn speed, we 
            // do not update it.
            if (Math.abs(newAnimationSpeed - this.currentAnimationSpeed) > 0.2) {
                this.currentAnimationSpeed = newAnimationSpeed;
                animation.speedRatio = this.currentAnimationSpeed;
            }

            this.angle = this.rotatable.angle;
            this.direction = this.rotatable.direction;
        }

        if (this.animationsEnabled) {
            // When the rotatable is no longer rotating.
            this.rotatable.emitter.on("rotateEnd", () => {
                // End the current animation if we are in one.
                if (this.currentAnimation !== undefined) {this.currentAnimation.stop();}
                this.currentAnimation = undefined;
                
                if (this.rotationEnabled) {
                    this.emitter.trigger("rotateEnd");
                }
            });

            // No change if we are still turning in the same direction.
            if (this.currentAnimation !== animation) {
                // Change the animation.
                if (this.currentAnimation !== undefined) {this.currentAnimation.stop();}
                this.currentAnimation = animation;
                animation.play(true);
            }
        }
    }

    setAngle(angle: number) {
        this.rotatable.setAngle(angle);
        this.direction = this.rotatable.direction;
        return this;
    }

    /**
     * Disable rotation animations.
     */
    disableAnimations() {
        if (this.currentAnimation !== undefined) {
            this.currentAnimation.stop();
        }
        this.animationsEnabled = false;
    }

    /**
     * Enable rotation animations.
     */
    enableAnimations() {
        // Continue animation we left on when 
        // disabling.
        if (this.currentAnimation !== undefined) {
            this.currentAnimation.play(true);
        }
        this.animationsEnabled = true;
    }

    /**
     * Enable rotation. Does not enable animations.
     */
    enableRotation() {
        this.rotatable.enableAutoUpdate();
        this.rotationEnabled = true;
    }

    /**
     * Disable rotation. Does not disable animations.
     */
    disableRotation() {
        this.rotatable.disableAutoUpdate();
        this.rotationEnabled = false;
    }
}