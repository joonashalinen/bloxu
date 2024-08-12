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
    timeAtJumpStart: number = 0;
    jumpFactor: number = 6.5;
    /* private _basePerpetualMotionDirection: Vector3; */
    private _creatureHasLanded = false;
    
    constructor(creatureBody: CreatureBody,
        public jumpAnimation: AnimationGroup) {
        super(creatureBody);
        this.creatureBody.onLanding(this._handleLandingEvent.bind(this));
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
        this._creatureHasLanded = false;
        this.timeAtJumpStart = 0;

        /* this._basePerpetualMotionDirection = this.creatureBody
            .perpetualMotionDirection.clone(); */

        // Play the jumping animation.
        this.jumpAnimation.speedRatio = 0.4;
        this.jumpAnimation.play();
        this.jumpAnimation.goToFrame(50);

        const bodyMass = this.creatureBody.physicsBody()
            .getMassProperties().mass;
        this.creatureBody.physicsBody().applyImpulse(
            new Vector3(0, bodyMass * this.jumpFactor, 0), 
            this.creatureBody.transformNode.absolutePosition
        );

        //this._updatePerpetualMotionDirection(0);
    }

    end(): void {
        if (!this.isActive) return;
        super.end();
        this.jumpAnimation.stop();
        /* Device.prototype.setPerpetualMotionDirection.apply(
            this.creatureBody, this._basePerpetualMotionDirection); */
    }

    /**
     * Updates the state based on the passed time.
     */
    doOnTick(passedTime: number, absoluteTime: number) {
        if (!this.isActive) return;
        if (this.timeAtJumpStart === 0) {
            this.timeAtJumpStart = absoluteTime;
        }
        if (this.creatureBody.asPhysical.isInTerminalFreefall()) {
            this.endWithEvent("airborne");
        } else if (this._creatureHasLanded) {
            if (!this.creatureBody.isInPerpetualMotion()) {
                this.endWithEvent("idle");
            } else {
                this.endWithEvent("move");
            }
        }/*  else {
            this._updatePerpetualMotionDirection(absoluteTime);
        } */
    }

    /**
     * Updates the perpetual motion direction of the 
     * Creature such that it reflects the current state of the jump.
     */
    private _updatePerpetualMotionDirection(absoluteTime: number) {
       /*  // How much time has passed in total since we started the jump.
        const totalTimePassed = absoluteTime - this.timeAtJumpStart;
        // Scale the sine coefficient such that it reaches its first
        // maximum when 1 second has passed. This way the 
        // jump will reach its maximum height after 1 second.
        // The maximum is reached at PI / 2. Thus, we divide this 
        // by 1000 to obtain our desired factor.
        const sineScalingFactor = (Math.PI / 2) / 1000;
        const upComponent = Vector3.Up().scaleInPlace(
            Math.sin(sineScalingFactor * totalTimePassed));
        
        const direction = upComponent.addInPlace(this._basePerpetualMotionDirection);
        Device.prototype.setPerpetualMotionDirection.apply(
            this.creatureBody, direction); */
    }

    /**
     * When the Creature has landed on ground.
     */
    private _handleLandingEvent(event: IPhysicsCollisionEvent) {
        if (!this.isActive) return;
        this._creatureHasLanded = true;
    }
}