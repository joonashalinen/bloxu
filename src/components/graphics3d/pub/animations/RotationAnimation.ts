import { AnimationGroup } from "@babylonjs/core";
import TimeAdjustedDifference from "../../../statistics/pub/TimeAdjustedDifference";
import MovingAverage from "../../../statistics/pub/MovingAverage";
import InteractiveAnimation from "../InteractiveAnimation";

/**
 * An animation that either plays a left turning animation 
 * or a right turning animation the current known rotation angle.
 * The animation's speed is adjusted based on how quickly 
 * the angle changes between updates.
 */
export default class RotationAnimation extends InteractiveAnimation {
    angle: number = 0;
    originalAnimationSpeed: number;
    currentAnimationSpeed: number;
    idleTimeout: unknown;

    turnAngleDifference = new TimeAdjustedDifference();
    turnAngleMovingAverage = new MovingAverage(300);

    constructor(
        public animations: {left: AnimationGroup,
            right: AnimationGroup, idle: AnimationGroup},
        public blendingSpeed: number = 0.2) {
        super();

        // Enable animation blending.
        [animations.left, animations.right].forEach((animation) => {
            animation.enableBlending = true;
            animation.blendingSpeed = blendingSpeed;
        });
        
        this.originalAnimationSpeed = animations.left.speedRatio;
        this.currentAnimationSpeed = animations.left.speedRatio;
    }

    setAngle(angle: number) {
        if (angle.toPrecision(3) === this.angle.toPrecision(3)) {return}
        // Clear timeout meant to return to idle animation once 
        // no turning is happening anymore. We want to reset 
        // the timeout, since because we are here, then 
        // turning is clearly still happening.
        if (this.idleTimeout !== undefined) {
            clearTimeout(this.idleTimeout as number);
        }

        this.idleTimeout = setTimeout(() => {
            if (!this.enabled()) return;
            if (this.currentAnimation !== undefined) {
                this.currentAnimation.stop();
            }
            this.currentAnimation = this.animations.idle;
            this.currentAnimation.play(true);
        }, 100);

        // Determine turn direction.
        const direction = angle < this.angle ? "left" : "right";

        // Determine turn speed.
        // Adjust the difference based on the passed time between updates.
        this.turnAngleDifference.observe(angle, Date.now());
        const timeAdjustedAngleDifference = Math.abs(this.turnAngleDifference.get());

        this.angle = angle;

        if (!this.enabled()) return;
        
        // Average the last N turn observations.
        const averagedAngleDifference = this.turnAngleMovingAverage
                                                                    .observe(timeAdjustedAngleDifference).get();

        // 80 is a magic number found via trial and error for making the turn animation look correct.
        // We also want to cap the animation speed. TODO: Get rid of this magic number.
        const newAnimationSpeed = Math.min(
            this.originalAnimationSpeed * averagedAngleDifference * 80,
            2
        );

        const animation = this.animations[direction];

        // If there is not enough of a different in the turn speed, we 
        // do not update it.
        if (Math.abs(newAnimationSpeed - this.currentAnimationSpeed) > 0.1) {
            this.currentAnimationSpeed = newAnimationSpeed;
            animation.speedRatio = this.currentAnimationSpeed;
        }

        // No change if we are still turning in the same direction.
        if (this.currentAnimation !== animation) {
            // Change the animation.
            if (this.currentAnimation !== undefined) {this.currentAnimation.stop();}
            this.currentAnimation = animation;
            animation.play(true);
        }
    }

    disable() {
        super.disable();
        this.currentAnimation = this.animations.idle;
    }
}