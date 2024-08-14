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
    private _creatureHasLanded = false;
    private _restoreRotationAnimation: boolean;
    
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

        // Play the jumping animation.
        this.jumpAnimation.speedRatio = 0.4;
        this.jumpAnimation.play();
        this.jumpAnimation.goToFrame(50);

        this._restoreRotationAnimation = this.creatureBody
            .horizontalRotationAnimation.enabled();
        this.creatureBody.horizontalRotationAnimation.disable();

        const bodyMass = this.creatureBody.physicsBody()
            .getMassProperties().mass;
        this.creatureBody.physicsBody().applyImpulse(
            new Vector3(0, bodyMass * this.jumpFactor, 0), 
            this.creatureBody.transformNode.absolutePosition
        );
    }

    end(): void {
        if (!this.isActive) return;
        super.end();
        this.jumpAnimation.stop();
        if (this._restoreRotationAnimation) {
            this.creatureBody.horizontalRotationAnimation.enable();
        }
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
        }
    }

    /**
     * When the Creature has landed on ground.
     */
    private _handleLandingEvent(event: IPhysicsCollisionEvent) {
        if (!this.isActive) return;
        this._creatureHasLanded = true;
    }
}