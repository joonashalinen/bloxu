import IEventable from "../../events/pub/IEventable";
import IState from "./IState";

/**
 * A state in a finite state machine. In addition, the state owns resources. 
 * The owned resources are represented via unique string ids 
 * determined by the user of the IState.
 */
export default interface IOwningState<TResource> extends IState, IEventable {
    /**
     * String ids of the resources the state owns.
     */
    ownedResources: Set<TResource>;

    /**
     * Ids of the resources the state 
     * will take control of if given them.
     */
    wantedResources: Set<TResource>

    /**
     * Start the state. Returns the ids of resources the 
     * state takes control of.
     */
    start(availableResources: Set<TResource>): Set<TResource>;
    
    /**
     * Ends the state. Returns the ids of the resources 
     * the state frees upon ending.
     */
    end(): Set<TResource>;

    /**
     * When the state ends itself.
     */
    onEnd(callback: (nextStateId: string, freedResources: Set<TResource>) => void): IOwningState<TResource>;

    /**
     * Give the state control of resources with 
     * the given ids.
     */
    give(resources: Set<TResource>): Set<TResource>;

    /**
     * Take away control of resources with 
     * the given ids. An implementation of IOwningState 
     * must be able to handle taking away control of its resources.
     */
    take(resources: Set<TResource>): Set<TResource>;
}