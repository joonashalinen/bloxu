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
export default class AnimatedRotatable implements IObject, IRotatable {
    transformNode: TransformNode;
    
    currentAnimation: AnimationGroup | undefined;
    animationsEnabled: boolean = true;
    rotationEnabled: boolean = true;

    originalAnimationSpeed: number;
    currentAnimationSpeed: number;

    turnAngleDifference = new TimeAdjustedDifference();
    turnAngleMovingAverage = new MovingAverage(300);

    get angle() {
        return this.rotatable.angle;
    }
    get direction() {
        return this.rotatable.direction;
    }
    set setDirection(direction: Vector2) {
        this.rotatable.direction = direction;
    }

    constructor(
        public rotatable: IRotatable & IObject, 
        public animations: {left: AnimationGroup, right: AnimationGroup}
    ) {
        this.transformNode = rotatable.transformNode;

        // Enable animation blending.
        [animations.left, animations.right].map((animation) => {
            animation.enableBlending = true;
            animation.blendingSpeed = 0.2;
        });
        
        this.originalAnimationSpeed = animations.left.speedRatio;
        this.currentAnimationSpeed = animations.left.speedRatio;
    }

    setAngle(angle: number) {
        if (angle.toPrecision(3) === this.angle.toPrecision(3)) {return this}
        // Determine turn direction.
        const direction = angle < this.angle ? "left" : "right";

        // Determine turn speed.
        // Adjust the difference based on the passed time between updates.
        this.turnAngleDifference.observe(angle, Date.now());
        const timeAdjustedAngleDifference = Math.abs(this.turnAngleDifference.get());

        // Average the last N turn observations.
        const averagedAngleDifference = this.turnAngleMovingAverage
                                                                    .observe(timeAdjustedAngleDifference).get();

        // 80 is a magic number found via trial and error for making the turn animation look correct.
        // The animation speed also has to be at least 0.01, since a turning speed too near zero 
        // will not even be visible. Also, this way we avoid giving the turning speed a zero value.
        const newAnimationSpeed = Math.max(
            this.originalAnimationSpeed * averagedAngleDifference * 80,
            0.01
        );

        const animation = this.animations[direction];

        if (this.rotationEnabled) {
            // If there is not enough of a different in the turn speed, we 
            // do not update it.
            if (Math.abs(newAnimationSpeed - this.currentAnimationSpeed) > 0.2) {
                this.currentAnimationSpeed = newAnimationSpeed;
                animation.speedRatio = this.currentAnimationSpeed;
            }

            this.rotatable.setAngle(angle);
        }

        if (this.animationsEnabled) {
            // No change if we are still turning in the same direction.
            if (this.currentAnimation !== animation) {
                // Change the animation.
                if (this.currentAnimation !== undefined) {this.currentAnimation.stop();}
                this.currentAnimation = animation;
                animation.play(true);
            }
        }
        
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
        this.rotationEnabled = true;
    }

    /**
     * Disable rotation. Does not disable animations.
     */
    disableRotation() {
        this.rotationEnabled = false;
    }
}