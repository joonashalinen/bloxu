import { Vector3 } from "@babylonjs/core";
import AnimatedMovable from "../AnimatedMovable";
import IMovable from "../IMovable";
import IMovableState from "./IMovableState";
import TStateResource from "./TStateResource";
import OwningState from "../../../computation/pub/OwningState";
import IToggleable from "../../../misc/pub/IToggleable";
import EventableMovable from "../EventableMovable";
import ITickable from "../ITickable";

/**
 * State of a creature where the creature is currently moving in a direction.
 */
export default class MoveState extends OwningState<TStateResource> implements IMovableState, ITickable {
    wantedResources: Set<TStateResource> = new Set(["animation", "movement"]);
    lastDirection: Vector3 = new Vector3(0, 0, 0);

    constructor(
        public movable: IMovable & IToggleable,
        public tickableMovable: ITickable,
        public animatedMovable: AnimatedMovable,
        public eventableMovable: EventableMovable
    ) {
        super();

        eventableMovable.emitter.on("moveEnd", () => {
            this._endSelf("idle");
        });
    }

    doOnTick(time: number): ITickable {
        if (this.ownedResources.has("movement")) {
            this.tickableMovable.doOnTick(time);
        }
        return this;
    }

    move(direction: Vector3): IMovableState {
        this.lastDirection = direction;
        if (this.ownedResources.has("movement")) {
            this.movable.move(direction);
        }
        return this;
    }

    give(resources: Set<TStateResource>): Set<TStateResource> {
        const givenResources = super.give(resources);
        
        if (givenResources.has("animation")) {
            this.animatedMovable.enableAnimations();
        }
        if (givenResources.has("movement")) {
            this.movable.enable();
        }

        if (givenResources.has("animation") || givenResources.has("movement")) {
            if (!(this.lastDirection.equals(new Vector3(0, 0, 0)))) {
                this.movable.move(this.lastDirection);
            }
        }

        return givenResources;
    }

    take(resources: Set<TStateResource>): Set<TStateResource> {
        const takenResources = super.take(resources);

        if (takenResources.has("animation")) {
            this.animatedMovable.disableAnimations();
        }
        if (takenResources.has("movement")) {
            this.movable.disable();
        }

        return takenResources;
    }
}