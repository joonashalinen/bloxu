import { AnimationGroup, Vector3 } from "@babylonjs/core";
import ICreatureBodyState from "../../../computation/pub/ICreatureBodyState";
import CreatureBody from "./CreatureBody";
import CreatureBodyState from "./CreatureBodyState";
import Device from "../Device";

/**
 * A state of a Creature where the Creature is currently 
 * in air.
 */
export default class AirborneState extends CreatureBodyState implements ICreatureBodyState {
    name = "airborne";

    constructor(creatureBody: CreatureBody,
        public hoverAnimation: AnimationGroup) {
        super(creatureBody);
    }

    doItemMainAction(): void {
        // Cannot use items when airborne.
    }

    doItemSecondaryAction(): void {
        // Cannot use items when airborne.
    }

    start() {
        if (this.isActive) return;
        super.start();
        this.creatureBody.ownsRotationAnimations = false;
        this.creatureBody.horizontalRotationAnimation.disable();
        this.creatureBody.directionalAnimation.disable();
        this.playAnimation(this.hoverAnimation);
    }

    end() {
        if (!this.isActive) return;
        this.hoverAnimation.stop();
        super.end();
    }

    /**
     * Update the airborne state.
     */
    doOnTick(passedTime: number, absoluteTime: number) {
        if (!this.isActive) return;
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