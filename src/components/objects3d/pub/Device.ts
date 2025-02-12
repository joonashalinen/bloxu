import { AbstractMesh, Vector3 } from "@babylonjs/core";
import Object from "./Object";
import Physical from "./Physical";
import DirectionalAnimation from "../../graphics3d/pub/animations/DirectionalAnimation";
import RotationAnimation from "../../graphics3d/pub/animations/RotationAnimation";

/**
 * A Device is an Object that supports animated actions 
 * and interactions that can transcend regular physics. These 
 * actions include general ones related to motion and space as well as
 * client-defined input-triggerable actions.
 */
export default class Device extends Object {
    perpetualMotionDirection: Vector3 = new Vector3(0, 0, 0);
    respectVerticalVelocity: boolean = true;
    perpetualMotionSpeed: number = 0;

    directionalAnimation: DirectionalAnimation | undefined;
    horizontalRotationAnimation: RotationAnimation | undefined;
    disableRotationAnimationsWhenMoving: boolean = true;
    ownsRotationAnimations: boolean = true;
    
    constructor(wrappee: AbstractMesh | Physical) {
        
        super(wrappee);
    }

    /**
     * Updates the possibly existing directional motion animation
     * based on the given direction of perpetual motion.
     */
    updateDirectionalAnimation(direction: Vector3) {
        // Update directional movement animation.
        if (this.directionalAnimation !== undefined) {
            // The direction of the movement animation is 
            // relative to the faced direction.
            const relativeMotionDirection = Vector3.TransformNormal(
                direction.clone(), this.transformNode.getWorldMatrix().transpose())
            this.directionalAnimation.setDirection(relativeMotionDirection);
        }
    }

    /**
     * Sets the Device to have perpetual movement 
     * (while also ignoring gravity and inertia) in the given direction. 
     * If this.perpetualMotionSpeed is 0, then no movement 
     * will happen and normal physics will apply.
     */
    setPerpetualMotionDirection(direction: Vector3) {
        this.perpetualMotionDirection = direction.normalize();
        this.updateDirectionalAnimation(direction);
        if (this.horizontalRotationAnimation !== undefined &&
            this.ownsRotationAnimations) {
            if (this._rotationAnimationBlockedByMoving()) {
                // Make sure rotation animations are off when moving.
                this.horizontalRotationAnimation.disable();
            } else if (!this.isInPerpetualMotion()) {
                // If we have stopped moving, make sure to re-enable
                // rotation animations.
                this.horizontalRotationAnimation.enable();
            }
        }
    }

    /**
     * Sets the rotation of the device along the horizontal plane formed 
     * by its forward and left axis vectors. Also plays appropriate 
     * turning animations if such are set and enabled.
     */
    setHorizontalAngle(angle: number) {
        if (!this.horizontalRotationEnabled) return;
        if (this.isInVoid) return;
        super.setHorizontalAngle(angle);

        // Update rotation animation.
        if (this.horizontalRotationAnimation !== undefined && 
            !this._rotationAnimationBlockedByMoving()) {
            
            this.horizontalRotationAnimation.setAngle(angle);
        }

        this.updateDirectionalAnimation(this.perpetualMotionDirection);
    }

    /**
     * Whether the device has non-zero perpetual motion speed
     * in the direction of a non-zero vector.
     */
    isInPerpetualMotion() {
        return (this.perpetualMotionSpeed !== 0 && 
            !this.perpetualMotionDirection.equals(Vector3.ZeroReadOnly));
    }

    /**
     * Returns true if rotation animations are set to 
     * disable when moving and we are moving (we have 
     * a set perpetual motion direction that is non-zero and 
     * our motion speed is non-zero).
     */
    _rotationAnimationBlockedByMoving() {
        return (this.disableRotationAnimationsWhenMoving && 
            this.isInPerpetualMotion());
    }

    /**
     * Updates the linear velocity of the physics body to 
     * reflect the set .perpetualMotionSpeed and
     * .perpetualMotionDirection
     */
    _updateLinearVelocity() {
        const newBaseVelocity = this.perpetualMotionDirection.scale(this.perpetualMotionSpeed);
        if (this.respectVerticalVelocity) {
            const currentVelocity = this.asPhysical.physicsAggregate.body.getLinearVelocity();
            const newVelocity = new Vector3(
                newBaseVelocity.x,
                currentVelocity.y,
                newBaseVelocity.z);
            this.asPhysical.physicsAggregate.body.setLinearVelocity(newVelocity);
        } else {
            this.asPhysical.physicsAggregate.body.setLinearVelocity(newBaseVelocity);
        }
    }

    doOnTick(passedTime: number, absoluteTime: number) {
        if (this.isInVoid) return;
        this._updateLinearVelocity();
        super.doOnTick(passedTime, absoluteTime);
    }
    
    /**
     * What to do when an object collides with the device.
     * By default does nothing, but inheriting classes 
     * can provide their own implementations.
     */
    handleCollidedAgainstObjectEvent(object: Object) {
    }
}