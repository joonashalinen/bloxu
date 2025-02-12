import { AnimationGroup, Vector3 } from "@babylonjs/core";
import ICreatureBodyState from "../../../computation/pub/ICreatureBodyState";
import CreatureBody from "./CreatureBody";
import CreatureBodyState from "./CreatureBodyState";

/**
 * A state of a Creature where the Creature is 
 * idle, not doing anything.
 */
export default class IdleState extends CreatureBodyState implements ICreatureBodyState {
    name = "idle";

    constructor(creatureBody: CreatureBody,
        public idleAnimation: AnimationGroup) {
        super(creatureBody);
    }

    start() {
        if (this.isActive) return;
        super.start();
        if (this.creatureBody.directionalAnimation !== undefined) {
            this.creatureBody.directionalAnimation.disable();
        }
        this.idleAnimation.start(true);
    }

    end() {
        if (!this.isActive) return;
        super.end();
        this.idleAnimation.stop();
    }
    
    doOnTick(passedTime: number, absoluteTime: number): void {
        if (!this.isActive) return;
        super.doOnTick(passedTime, absoluteTime);
        if (!this.isActive) return;
        if (this._jumped) {
            this.endWithEvent("jump");
        } else if (this._moved) {
            this.endWithEvent("move");
        }
    }
}