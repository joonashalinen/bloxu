
/**
 * A state in a finite state machine.
 */
export default interface IState {
    isActive: boolean;

    /**
     * Start the state. Implementations 
     * are free to set their own accepted 
     * arguments as well as the return value for this method.
     */
    start(...args: unknown[]): unknown | void;
    
    /**
     * Ends the state.
     */
    end(): unknown | void;

    /**
     * When the state ends itself.
     */
    onEnd(callback: (nextStateId: string, ...args: unknown[]) => void): IState | void;
}