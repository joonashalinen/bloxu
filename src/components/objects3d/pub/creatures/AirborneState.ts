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
    private _creatureHasLanded: boolean = false;

    constructor(creatureBody: CreatureBody,
        public hoverAnimation: AnimationGroup) {
        super(creatureBody);
        this.creatureBody.onLanding(() => {
            this._creatureHasLanded = true;
        });
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

        this._creatureHasLanded = false;
        this.creatureBody.directionalAnimation.disable();
        this.hoverAnimation.play();
    }

    end() {
        if (!this.isActive) return;
        super.end();
        this.hoverAnimation.stop();
        this.creatureBody.directionalAnimation.enable(false);
    }

    /**
     * Update the airborne state.
     */
    doOnTick(passedTime: number, absoluteTime: number) {
        if (!this.isActive) return;
        if (this._creatureHasLanded) {
            if (!this.creatureBody.isInPerpetualMotion()) {
                this.endWithEvent("idle");
            } else {
                this.endWithEvent("move");
            }
        }
    }
}