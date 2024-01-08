import { Vector3 } from "@babylonjs/core";
import IOwningState from "../../../computation/pub/IOwningState";
import EventEmitter from "../../../events/pub/EventEmitter";
import TCompassPoint from "../../../geometry/pub/TCompassPoint";
import AnimatedMovable from "../AnimatedMovable";
import IMovable from "../IMovable";
import IMovableState from "./IMovableState";
import TStateResource from "./TStateResource";
import OwningState from "../../../computation/pub/OwningState";
import IEventable from "../../../events/pub/IEventable";
import IAutoUpdatable from "../IAutoUpdatable";
import IToggleable from "../../../misc/pub/IToggleable";

/**
 * State of a creature where the creature is currently moving in a direction.
 */
export default class MoveState extends OwningState<TStateResource> implements IMovableState {
    wantedResources: Set<TStateResource> = new Set(["animation", "movement"]);

    constructor(
        public movable: IMovable & IEventable & IToggleable,
        public animatedMovable: AnimatedMovable
    ) {
        super();

        movable.emitter.on("moveEnd", () => {
            this._endSelf("idle");
        });
    }

    move(direction: Vector3): IMovableState {
        if (this.isActive) {
            this.movable.move(direction);
        }
        return this;
    }

    give(resources: Set<TStateResource>): Set<TStateResource> {
        const givenResources = super.give(resources);
        
        if (resources.has("animation")) {
            this.animatedMovable.enableAnimations();
        }
        if (resources.has("movement")) {
            this.movable.enable();
        }

        return givenResources;
    }

    take(resources: Set<TStateResource>): Set<TStateResource> {
        const takenResources = super.give(resources);

        if (takenResources.has("animation")) {
            this.animatedMovable.disableAnimations();
        }
        if (takenResources.has("movement")) {
            this.movable.disable();
        }

        return takenResources;
    }
}