import EventEmitter from "../../events/pub/EventEmitter";
import IOwningState from "./IOwningState";

/**
 * Contains operations and state that 
 * all IOwningState implementations need.
 */
export default abstract class OwningState<TResource> implements IOwningState<TResource> {
    ownedResources: Set<TResource> = new Set();
    isActive: boolean = false;
    emitter: EventEmitter = new EventEmitter();
    abstract wantedResources: Set<TResource>;

    constructor() {
        
    }

    start(availableResources: Set<TResource>): Set<TResource> {
        return this.give(availableResources);
    }

    end(): Set<TResource> {
        return this.take(this.ownedResources);
    }

    onEnd(callback: (nextStateId: string, freedResources: Set<TResource>) => void): IOwningState<TResource> {
        this.emitter.on("end", callback);
        return this;
    }

    give(resources: Set<TResource>): Set<TResource> {
        const givenResources = new Set(Array.from(resources).filter((r) => this.wantedResources.has(r)));
        if (givenResources.size !== 0) {
            this.isActive = true;
        }
        Array.from(givenResources).forEach((r) => this.ownedResources.add(r));
        return givenResources;
    }

    take(resources: Set<TResource>): Set<TResource> {
        const takenResources = new Set(Array.from(resources).filter((r) => this.ownedResources.has(r)));
        if (takenResources.size === this.ownedResources.size) {
            this.isActive = false;
        }
        Array.from(takenResources).forEach((r) => this.ownedResources.delete(r));
        return takenResources;
    }

    /**
     * End the state from within.
     */
    protected _endSelf(nextStateId: string) {
        if (this.isActive) {
            console.log(nextStateId);
            const freedResources = this.end();
            this.emitter.trigger("end", [nextStateId, freedResources]);
        }
    }
}