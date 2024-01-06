import IState from "./IState";

/**
 * Common interface for all (non-deterministic) state machines.
 */
export default interface IStateMachine<TState extends IState> {
    activeStates: {[id: string]: TState};
    states: {[id: string]: TState}

    /**
     * Enter a state with given id.
     */
    activateState(id: string, args: unknown[]): IStateMachine<TState>;

    /**
     * Leave a state with given id.
     */
    deactivateState(id: string): IStateMachine<TState>;

    /**
     * Change activation from one state to another. The end result 
     * of the ended state is by default used as the input for the 
     * new state. If the 'from' state is not currently active, then the 'args' array 
     * given to .changeState is used as the input arguments for 
     * the new state instead.
     */
    changeState(from: string, to: string, args: unknown[]): IStateMachine<TState>

    /**
     * Function that transforms an ended state's 
     * output into the input for the next state.
     */
    transformStateResult: (...args: unknown[]) => unknown[];

    /**
     * Function that is called before moving to a new state 
     * when changing from a state to another one. 
     * The parameters given to the function are the 
     * return values of the previously ended state.
     */
    doBeforeChangeState: (nextStateId: string, ...args: unknown[]) => undefined;
}