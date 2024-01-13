import IOwningState from "./IOwningState";
import IState from "./IState";
import IStateMachine from "./IStateMachine";

export interface TResourceOwner<TResource> {
    id: string;
    resource: TResource;
}

/**
 * A non-deterministic state machine that owns resources and gives 
 * exclusive control of them to the active states. ResourceStateMachine is 
 * not concerned with the activation status of states but rather 
 * cares about the ownership of resources. Consequently, calling 
 * .activateState for an active state for example is valid and allowed, since 
 * doing so may give it some resources even if it is not currently active. 
 * Similarly, calling .activateState may not result in the state becoming active, 
 * since if no resources are available, it will not take anything and 
 * will thus not become active either.
 */
export default class ResourceStateMachine<TResource> implements IStateMachine<IOwningState<TResource>> {
    availableResources: Set<TResource>;
    doBeforeChangeState: (nextStateId: string, ...args: unknown[]) => undefined = () => undefined;
    activeStates: { [id: string]: IOwningState<TResource>; } = {};
    transformStateResult: (...args: unknown[]) => unknown[] = (...args: unknown[]) => args;
    /**
     * Stack that stores the information of which 
     * state has owned which resource in which order.
     * The record is kept only for resource transfers 
     * where resources are forcibly taken from another state. Thanks to 
     * the stack, once the receiving state ends, their resources can be returned 
     * to the previous owner.
     */
    transferOwnershipStack: TResourceOwner<TResource>[] = [];

    constructor(
        public states: {[id: string]: IOwningState<TResource>},
        public allResources: Set<TResource>,
        public startingStateId?: string,
    ) {
        this.availableResources = allResources;
        for (let id in states) {
            let state = states[id];
            this._listenToStateEnd(id, state);
        }

        if (startingStateId !== undefined) {
            this.activateState(startingStateId);
        }
    }

    /**
     * In ResourceStateMachine, changing state is interpreted as 
     * moving resources from a state to another. The receiving state 
     * has priority over the transferred resources, as opposed to 
     * the behaviour of .deactivateState, where the released resources 
     * may be distributed to other states that were waiting 
     * to get them back.
     */
    changeState(from: string, to: string, args: unknown[]): IStateMachine<IOwningState<TResource>> {
        if (!(from in this.activeStates)) {
            throw new Error("Trying to change from non-active state '" + from + "'.");
        }
        const resources = args[0] as Set<TResource>;
        this.transferResources(from, to, resources);
        return this;
    }

    /**
     * Let the state with the given id take all the resources 
     * it wants from the list of available resources.
     */
    activateState(id: string): Set<TResource> {
        if (this.availableResources.size !== 0) {
            return this.giveResources(id, new Set(Array.from(this.availableResources)));
        } else {
            return new Set();
        }
    }

    /**
     * Takes all owned resources from the state with the given id. 
     * The freed resources are either returned to active states 
     * that previously owned the resources and were waiting to get 
     * them back or added to the list of available resources.
     */
    deactivateState(id: string): Set<TResource> {
        const state = this.states[id];
        if (state.ownedResources.size !== 0) {
            return this.takeResources(id, new Set(Array.from(state.ownedResources)));
        } else {
            return new Set();
        }
    }

    /**
     * Takes control of the given resources from one state and gives 
     * them to another. States that previously had control over 
     * the transferred resources are bypassed and not allowed 
     * to hijack the resources.
     */
    transferResources(fromStateId: string, toStateId: string, resources: Set<TResource>) {
        // Take the resources from the resource-giving state.
        const takenResources = this.takeResources(fromStateId, resources, true);
        // Give resources to the receiving state.
        this.giveResources(toStateId, resources);
        return takenResources;
    }

    /**
     * Free the specified resources from the given state.
     */
    takeResources(stateId: string, resources: Set<TResource>, stealing: boolean = false) {
        if (stateId in this.activeStates) {
            const state = this.activeStates[stateId];
            if (!(state.isActive)) {
                throw new Error(
                    "State '" + stateId + "' is in the list of " + 
                    "active states but is not active."
                );
            }
            // Filter out resources that the state does not have.
            const resourcesToTake = Array.from(resources).filter((r) => state.ownedResources.has(r));
            // Take the resources from the state.
            const freedResources = state.take(new Set(resourcesToTake));
            
            // If the state is no longer active.
            if (state.ownedResources.size === 0) {
                delete this.activeStates[stateId];
            }

            // If we are forcibly taking the resources 
            // in order to give them to another state.
            if (stealing) {
                Array.from(freedResources).forEach((r) => {
                    // Save the information that the resource-giving state 
                    // owned the resource last before having it forcibly taken.
                    this.transferOwnershipStack.push({id: stateId, resource: r});
                    // Add back the resource to the available resources.
                    this.availableResources.add(r)
                });
                return freedResources;
            } else {
                return this.redirectFreedResources(freedResources);
            }
        } else {
            return new Set<TResource>();
        }
    }

    /**
     * Give the specified resources to the given state 
     * or a subset of them if not all of them are available.
     */
    giveResources(stateId: string, resources: Set<TResource>) {
        const state = this.states[stateId];
        const availableToGive = new Set(
            Array.from(resources).filter((resource) => {
                return this.availableResources.has(resource);
            })
        );
        
        const givenResources = state.give(availableToGive);
        givenResources.forEach((r) => this.availableResources.delete(r));

        // If we gave resources to the state, then 
        // it becomes active if it was no already.
        if (givenResources.size !== 0 && !(stateId in this.activeStates)) {
            this.activeStates[stateId] = this.states[stateId];
        }

        return givenResources;
    }

    /**
     * Take away the specified resources from all 
     * active states.
     */
    takeResourcesFromAll(resources: Set<TResource>) {
        const takenResources = [...Object.keys(this.activeStates)].map((stateId) => {
            return this.takeResources(stateId, resources);
        });
        return new Set(takenResources.flat(1));
    }

    /**
     * Gather the specified resources from all active states 
     * and give them to the specified state.
     */
    transferResourcesFromAll(toStateId: string, resources: Set<TResource>) {
        this.takeResourcesFromAll(resources);
        return this.giveResources(toStateId, resources);
    }

    /**
     * Find who has control of the given resource. 
     * If no one does, then returns undefined.
     */
    ownerOfResource(resource: TResource) {
        return Object.values(this.activeStates).find((state) => {
            return state.ownedResources.has(resource);
        });
    }

    /**
     * Either give back the freed resources to the states that previously owned 
     * them or add them to the list of available resources. Giving back 
     * the resources is prioritized and if no state is waiting to get the 
     * a resource back, then it will be added to available resources. 
     */
    redirectFreedResources(resources: Set<TResource>) {
        // Return resources to possible previous owners
        // from whom the resources were forcibly taken from.
        const returnedResources = this.returnResources(resources);
        // Resources that were not returned.
        const unreturnedResources = new Set(Array.from(resources).filter((r) => !returnedResources.has(r)));
        // Return unreturned resources to the pool of available resources.
        unreturnedResources.forEach((r) => this.availableResources.add(r));
        return unreturnedResources;
    }

    /**
     * Return ownership of resources 
     * to the state that last owned them before 
     * having them forcibly taken.
     */
    returnResources(resources: Set<TResource>) {
        const resourcesClone = new Set([...Array.from(resources)]);
        const returnedResources = new Set<TResource>();
        // Copy stack of ownerships.
        const ownerships = [...this.transferOwnershipStack];
        // Give back resources to previous owners. 
        // Returns the indices of the ownerships that were returned.
        // -1 means that no ownership was returned for that ownership record.
        const ownershipRemovals = ownerships.map((ownership, index) => {
            const state = this.states[ownership.id];
            if (!state.isActive) {
                // If the state is not active then 
                // we do not want to return resources to it.
                // We also want to remove it from 
                // future consideration of regaining the resource.
                return index;
            } else if (resourcesClone.has(ownership.resource)) {
                // Give back the resource.
                this.giveResources(ownership.id, new Set([ownership.resource]));
                returnedResources.add(ownership.resource);
                resourcesClone.delete(ownership.resource);
                return index;
            } else {
                // Do not give back the resource but also 
                // do not remove the state from the list of previous owners.
                return -1;
            }
        });
        // Filter out the -1's so that we have only the list of indices of 
        // ownerships returned.
        const ownershipIndicesToRemove = ownershipRemovals.filter((i) => i !== -1);
        // Remove the ownership records of the ownerships that were returned.
        // We remove them in descending order since the removals are done in-place.
        ownershipIndicesToRemove.reverse().forEach((i) => this.transferOwnershipStack.splice(i, 1));
        return returnedResources;
    }

    /**
     * Add a listener for a state ending itself on its own.
     */
    private _listenToStateEnd(stateId: string, state: IOwningState<TResource>) {
        state.onEnd((nextStateId: string, ...args: unknown[]) => {
            const freedResources = args[0] as Set<TResource>;
            // Mark the state as no longer active.
            delete this.activeStates[stateId];
            // If there is a next state to go to.
            if (nextStateId in this.states) {
                // Next state.
                const nextState = this.states[nextStateId] as IOwningState<TResource>;
                // Resources the next state does not want.
                const unwantedResources = new Set(Array.from(freedResources).filter((r) => !nextState.wantedResources.has(r)));
                // Redirect the unwanted resources either to other states 
                // or add them back to the list of available resources.
                this.redirectFreedResources(unwantedResources);
                // Add the wanted resources to available resources 
                // so that the next state can take control of them.
                const wantedResourcesFreed = Array.from(freedResources).filter((r) => nextState.wantedResources.has(r));
                wantedResourcesFreed.forEach((r) => this.availableResources.add(r));
                this.doBeforeChangeState(nextStateId, args);

                // Activate the next state.
                this.activateState(nextStateId);
            } else {
                // Redirect all the resources either to other states 
                // or add them back to the list of available resources.
                this.redirectFreedResources(freedResources);
            }
            console.log(this.activeStates);
        });
    }
}