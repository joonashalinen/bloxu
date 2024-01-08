import IOwningState from "./IOwningState";
import IStateMachine from "./IStateMachine";
import ResourceStateMachine from "./ResourceStateMachine";

/**
 * A ResourceStateMachine with the added feature 
 * of override permissions, allowing the user to  
 * specify which states are allowed to steal which resources 
 * from which states.
 */
export default class PermissionResourceStateMachine<TResource> 
    implements IStateMachine<IOwningState<TResource>> 
{
    overridePermissions: {[overriderId: string]: {[overrideeId: string]: Set<TResource>}} = {};

    public get activeStates(): { [id: string]: IOwningState<TResource>; } {
        return this.resourceStateMachine.activeStates;
    }
    public set activeStates(value: { [id: string]: IOwningState<TResource>; }) {
        this.resourceStateMachine.activeStates = value;
    }

    public get states(): { [id: string]: IOwningState<TResource>; } {
        return this.resourceStateMachine.states;
    }
    public set states(value: { [id: string]: IOwningState<TResource>; }) {
        this.resourceStateMachine.states = value;
    }

    public get transformStateResult(): (...args: unknown[]) => unknown[] {
        return this.resourceStateMachine.transformStateResult;
    }
    public set transformStateResult(value: (...args: unknown[]) => unknown[]) {
        this.resourceStateMachine.transformStateResult = value;
    }

    public get doBeforeChangeState(): (nextStateId: string, ...args: unknown[]) => undefined {
        return this.resourceStateMachine.doBeforeChangeState;
    }
    public set doBeforeChangeState(value: (nextStateId: string, ...args: unknown[]) => undefined) {
        this.resourceStateMachine.doBeforeChangeState = value;
    }

    constructor(public resourceStateMachine: ResourceStateMachine<TResource>) {
        
    }

    activateState(id: string): Set<TResource> {
        return this.resourceStateMachine.activateState(id);
    }

    deactivateState(id: string): Set<TResource> {
        return this.resourceStateMachine.deactivateState(id);
    }

    changeState(from: string, to: string, args: unknown[]): IStateMachine<IOwningState<TResource>> {
        const resources = args[0] as Set<TResource>;
        // Resources that are available that the next state wants.
        const resourcesFreeToTake = new Set(
            Array.from(resources).filter((r) => {
                return this.resourceStateMachine.availableResources.has(r);
            })
        );
        
        // Next we determine the resources the next state will steal from the 
        // previous state.
        
        // Resources that the next state wants that are not available.
        const resourcesStateWantsToSteal = Array.from(resources).filter((r) => !resourcesFreeToTake.has(r));
        
        var resourcesToSteal: TResource[];
        // If override permissions are set for the states 
        // then we check whether the next state can 
        // steal resources from the previous state.
        if (
            resourcesStateWantsToSteal.length !== 0 && 
            to in this.overridePermissions &&
            from in this.overridePermissions[to]
        ) {
            // The state has permission to steal some resources from the 
            // previous state.
            const resourcesAllowedToSteal = this.overridePermissions[to][from];
            resourcesToSteal = resourcesStateWantsToSteal.filter((r) => {
                return resourcesAllowedToSteal.has(r);
            });
        } else {
            // If no override permissions set, then the next state 
            // has no permission to steal any resources.
            resourcesToSteal = [];
        }

        // The resources to give to the next state are the concatenation of 
        // available resources and the resources the next 
        // state will steal from the previous state.
        const nextStateResources = new Set(Array.from(resourcesFreeToTake).concat(resourcesToSteal));
        
        this.resourceStateMachine.changeState(from, to, [nextStateResources]);

        return this;
    }
}