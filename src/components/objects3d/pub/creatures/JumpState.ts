import { PhysicsAggregate, Vector3 } from "@babylonjs/core";
import TStateResource from "./TStateResource";
import OwningState from "../../../computation/pub/OwningState";
import IKeyableState from "./IKeyableState";
import Jumpable from "./Jumpable";

/**
 * State of a creature where the creature is jumping.
 */
export default class JumpState extends OwningState<TStateResource> implements IKeyableState {
    wantedResources: Set<TStateResource> = new Set(["animation"]);
    jumpable: Jumpable;

    constructor(
        public physicsAggregate: PhysicsAggregate
    ) {
        super();
        this.jumpable = new Jumpable(physicsAggregate);
        this.jumpable.emitter.on("jumpEnd", () => {
            if (this.isActive) {
                this._endSelf("idle");
            }
        });
    }

    jump(): JumpState {
        if (this.isActive) {
            this.jumpable.jump();
        }
        return this;
    }

    pressFeatureKey(key: string): IKeyableState {
        if (this.isActive) {
            if (key === " ") {
                this.jump();
            }
        }
        return this;
    }

    releaseFeatureKey(key: string): IKeyableState {
        return this;
    }
    
    give(resources: Set<TStateResource>): Set<TStateResource> {
        const givenResources = super.give(resources);
        
        if (resources.has("animation")) {
            
        }

        return givenResources;
    }

    take(resources: Set<TStateResource>): Set<TStateResource> {
        const takenResources = super.take(resources);

        if (takenResources.has("animation")) {
            
        }

        return takenResources;
    }
}