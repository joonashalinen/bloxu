import { Vector3 } from "@babylonjs/core";
import ICreatureBodyState from "../../../computation/pub/ICreatureBodyState";
import CreatureBody from "./CreatureBody";
import CreatureBodyState from "./CreatureBodyState";
import Device from "../Device";

/**
 * A state of a Creature where the Creature 
 * is currently in perpetual motion.
 */
export default class MoveState extends CreatureBodyState implements ICreatureBodyState {
    name = "move";

    constructor(creatureBody: CreatureBody) {
        super(creatureBody);
    }

    start(...args: unknown[]): void {
        if (this.isActive) return;
        super.start();
        this.creatureBody.ownsRotationAnimations = false;
        this.creatureBody.horizontalRotationAnimation.disable();
        this.creatureBody.directionalAnimation.enable();
    }

    end(): void {
        if (!this.isActive) return;
        super.end();
        this.creatureBody.directionalAnimation.disable();
    }

    doOnTick(passedTime: number, absoluteTime: number): void {
        if (!this.isActive) return;
        super.doOnTick(passedTime, absoluteTime);
        if (!this.isActive) return;
        if (this._jumped) {
            this.endWithEvent("jump");
        } else if (!this.creatureBody.isInPerpetualMotion()) {
            this.endWithEvent("idle");
        }
    }
}