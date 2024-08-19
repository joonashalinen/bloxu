import { AnimationGroup, Vector2, Vector3 } from "@babylonjs/core";
import DiscreteVector from "./DiscreteVector";
import Animation from "./Animation";

/**
 * An animation that plays an animation from a list of 
 * animations based on a current known direction vector.
 */
export default class DirectionalAnimation extends Animation {
    rotationOffset: number = 0;

    constructor(
        public directions: Array<Vector2>,
        public animations: Array<AnimationGroup>) {
        super();

        if (this.animations.length !== this.directions.length) {
            throw new Error("There must be equally as many " + 
                "directions given as there are given animations.");
        }
        this.directions = directions;
        this.animations = animations;
    }

    /**
     * Sets the current direction and ensures the correct 
     * animation is played.
     */
    setDirection(direction: Vector3) {
        // Currently we only do directional animations in 2D.
        const direction2D = new Vector2(direction.x, direction.z);
        const [discreteDirection, directionIndex] = (new DiscreteVector(
            this.directions)).round(direction2D);
        
        const animation = this.animations[directionIndex];
        if (animation !== undefined && animation !== this.currentAnimation) {
            if (this.enabled()) {
                if (this.currentAnimation !== undefined) {
                    this.currentAnimation.stop();
                }
                animation.play(true);
            };
            this.currentAnimation = animation;
        }
    }
}