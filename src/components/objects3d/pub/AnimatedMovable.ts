import { AnimationGroup, TransformNode, Vector2, Vector3 } from "@babylonjs/core";
import IMovable from "./IMovable";
import DiscreteVector from "../../graphics3d/pub/DiscreteVector";
import IObject from "./IObject";

/**
 * A movable that has direction-specific movement animations.
 */
export default class AnimatedMovable implements IMovable, IObject {
    currentAnimation: AnimationGroup;
    transformNode: TransformNode;

    constructor(
        public movable: IMovable & IObject, 
        public directions: Array<Vector2>, 
        public animations: Array<AnimationGroup>
    ) {
        this.transformNode = movable.transformNode;
        animations.forEach((animation) => {
            animation.enableBlending = true;
            animation.blendingSpeed = 0.2;
        });
    }

    move(direction: Vector3, onlyInDirection?: boolean | undefined): IMovable {
        // Currently we have only 2D movement along the x-z-plane implemented.
        const direction2D = new Vector2(direction.x, direction.z);
        const [discreteDirection, directionIndex] = (new DiscreteVector(this.directions)).round(direction2D);
        const animation = this.animations[directionIndex];
        if (animation !== undefined && animation !== this.currentAnimation) {
            if (this.currentAnimation !== undefined) {
                this.currentAnimation.stop();
            }
            animation.play(true);
            this.currentAnimation = animation;
        }
        this.movable.move(direction);
        return this;
    }
}