import IOwningState from "./IOwningState";
import IState from "./IState";
import IStateMachine from "./IStateMachine";

/**
 * A non-deterministic state machine that owns resources and gives 
 * exclusive control of them to the active states.
 */
export default class ResourceStateMachine<TResource> implements IStateMachine<IOwningState<TResource>> {
    availableResources: Set<TResource>;
    doBeforeChangeState: (nextStateId: string, ...args: unknown[]) => undefined = () => undefined;

    get transformStateResult(): (...args: unknown[]) => unknown[] {
        return this._stateMachine.transformStateResult;
    }
    set transformStateResult(f: (...args: unknown[]) => unknown[]) {
        this._stateMachine.transformStateResult = f;
    }

    get states() {
        return this._stateMachine.states;
    }
    set setStates(states: {[id: string]: IOwningState<TResource>}) {
        this._stateMachine.states = states;
    }

    get activeStates() {
        return this._stateMachine.activeStates;
    }
    set setActiveStates(states: {[id: string]: IOwningState<TResource>}) {
        this._stateMachine.activeStates = states;
    }

    constructor(
        private _stateMachine: IStateMachine<IOwningState<TResource>>,
        public allResources: Set<TResource>
    ) {
        this.availableResources = allResources;
        _stateMachine.doBeforeChangeState = (nextStateId: string, ...args: unknown[]) => {
            const freedResources = args[0] as Set<TResource>;
            freedResources.forEach((r) => this.availableResources.add(r));
            this.doBeforeChangeState(nextStateId, args);
        };
    }

    changeState(from: string, to: string, args: unknown[]): IStateMachine<IOwningState<TResource>> {
        const resources = args[0] as Set<TResource>;
        this.transferResources(from, to, resources);
        return this;
    }

    activateState(id: string): IStateMachine<IOwningState<TResource>> {
        this.giveResources(id, this.availableResources);
        return this;
    }

    deactivateState(id: string): IStateMachine<IOwningState<TResource>> {
        const state = this._stateMachine.states[id];
        state.ownedResources.forEach((r) => this.availableResources.add(r));
        this._stateMachine.deactivateState(id);
        return this;
    }

    /**
     * Takes control of the given resources from one state and gives 
     * them to another.
     */
    transferResources(fromStateId: string, toStateId: string, resources: Set<TResource>) {
        this.takeResources(fromStateId, resources);
        this.giveResources(toStateId, resources);
    }

    /**
     * Free the specified resources from the given state.
     */
    takeResources(stateId: string, resources: Set<TResource>) {
        const state = this.activeStates[stateId];
        const freedResources = state.take(resources);
        freedResources.forEach((r) => this.availableResources.add(r));
        
        // If the state no longer has any resources, 
        // we want to deactivate it, since it is not doing anything 
        // anyway.
        if (state.ownedResources.size === 0) {
            this._stateMachine.deactivateState(stateId);
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
        // it becomes active.
        if (givenResources.size !== 0) {
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
}