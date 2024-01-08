import { Vector3 } from "@babylonjs/core";
import IOwningState from "../../../computation/pub/IOwningState";
import EventEmitter from "../../../events/pub/EventEmitter";
import TCompassPoint from "../../../geometry/pub/TCompassPoint";
import AnimatedMovable from "../AnimatedMovable";
import IMovable from "../IMovable";
import IRotatableState from "./IRotatableState";
import TStateResource from "./TStateResource";
import AnimatedRotatable from "../AnimatedRotatable";
import OwningState from "../../../computation/pub/OwningState";
import EventableRotatable from "../EventableRotatable";

/**
 * State of a creature where the creature is currently rotating.
 */
export default class RotateState extends OwningState<TStateResource> implements IRotatableState {
    wantedResources: Set<TStateResource> = new Set(["animation", "rotation"]);

    get angle() {
        return this.rotatable.angle;
    }

    constructor(
        public rotatable: EventableRotatable<AnimatedRotatable>
    ) {
        super();

        rotatable.emitter.on("rotateEnd", () => {
            this._endSelf("idle");
        });
    }
    
    give(resources: Set<TStateResource>): Set<TStateResource> {
        const givenResources = super.give(resources);

        if (resources.has("animation")) {
            this.rotatable.rotatable.enableAnimations();
        }
        if (resources.has("rotation")) {
            this.rotatable.rotatable.enableRotation();
        }

        return givenResources;
    }

    take(resources: Set<TStateResource>): Set<TStateResource> {
        const takenResources = super.take(resources);

        if (takenResources.has("animation")) {
            this.rotatable.rotatable.disableAnimations();
        }
        if (takenResources.has("rotation")) {
            this.rotatable.rotatable.disableRotation();
        }

        return takenResources;
    }

    setAngle(angle: number): IRotatableState {
        if (this.isActive) {
            this.rotatable.setAngle(angle);
        }
        return this;
    }
}