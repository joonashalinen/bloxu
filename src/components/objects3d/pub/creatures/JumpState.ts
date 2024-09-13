import { AnimationGroup, IPhysicsCollisionEvent, Vector3 } from "@babylonjs/core";
import ICreatureBodyState from "../../../computation/pub/ICreatureBodyState";
import CreatureBody from "./CreatureBody";
import CreatureBodyState from "./CreatureBodyState";

/**
 * A state of a Creature where the 
 * Creature is in a jump that has been preceded 
 * by running.
 */
export default class JumpState extends CreatureBodyState implements ICreatureBodyState {
    name = "jump";
    timeAtJumpStart: number = 0;
    jumpFactor: number = 5.8;
    
    constructor(creatureBody: CreatureBody,
        public jumpAnimation: AnimationGroup) {
        super(creatureBody);
    }

    doItemMainAction(): void {
        // Cannot use items when jumping.
    }

    doItemSecondaryAction(): void {
        // Cannot use items when jumping.
    }

    start(...args: unknown[]): void {
        if (this.isActive) return;
        super.start();
        this.timeAtJumpStart = 0;
        this.creatureBody.ownsRotationAnimations = false;
        this.creatureBody.directionalAnimation.disable();
        this.creatureBody.horizontalRotationAnimation.disable();

        this.playAnimation(this.jumpAnimation);

        const bodyMass = this.creatureBody.physicsBody()
            .getMassProperties().mass;
        this.creatureBody.physicsBody().applyImpulse(
            new Vector3(0, bodyMass * this.jumpFactor, 0), 
            this.creatureBody.transformNode.absolutePosition
        );
    }

    end(): void {
        if (!this.isActive) return;
        this.jumpAnimation.stop();
        super.end();
    }

    /**
     * Updates the state based on the passed time.
     */
    doOnTick(passedTime: number, absoluteTime: number) {
        if (!this.isActive) return;
        if (this.timeAtJumpStart === 0) {
            this.timeAtJumpStart = absoluteTime;
        }
        super.doOnTick(passedTime, absoluteTime);
        if (!this.isActive) return;
        if (this._landed) {
            if (!this.creatureBody.isInPerpetualMotion()) {
                this.endWithEvent("idle");
            } else {
                this.endWithEvent("move");
            }
        }
    }
}