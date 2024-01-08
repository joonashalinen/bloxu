import IState from "./IState";
import IStateMachine from "./IStateMachine";

/**
 * A (non-deterministic) finite state machine.
 */
export default class StateMachine<TState extends IState> implements IStateMachine<TState> {
    activeStates: {[id: string]: TState} = {};
    transformStateResult = (...args: unknown[]) => args;
    doBeforeChangeState = (...args: unknown[]) => undefined;

    constructor(
        public states: {[id: string]: TState},
        public startingStateId?: string,
    ) {
        for (let id in states) {
            let state = states[id];
            this._listenToStateEnd(id, state);
        }

        if (startingStateId !== undefined) {
            this.activeStates[startingStateId] = states[startingStateId];
            this.activeStates[startingStateId].start();
        }
    }
    
    deactivateState(id: string) {
        if (!(id in this.activeStates)) {
            throw new Error("Trying to deactivate state that is not active.");
        }
        const state = this.activeStates[id];
        delete this.activeStates[id];
        return state.end();
    }

    changeState(from: string, to: string, args: unknown[] = []) {
        const fromState = this.states[from];

        if (fromState !== undefined) {
            const endResult = this.deactivateState(from);
            this.doBeforeChangeState(to, [endResult]);
            this.activateState(to, this.transformStateResult([endResult]));
        } else {
            this.activateState(to, args);
        }

        return this;
    }

    /**
     * Start given state with given args.
     */
    activateState(id: string, args: unknown[] = []) {
        if (id in this.activeStates) {
            throw new Error("Trying to activate state that is already active.");
        }
        const state = this.states[id];
        this.activeStates[id] = state;
        return state.start(...args);
    }

    /**
     * Add a listener for a state ending itself on its own.
     */
    private _listenToStateEnd(stateId: string, state: TState) {
        state.onEnd((nextState: string, ...args: unknown[]) => {
            if (!(stateId in this.activeStates)) {
                throw new Error("Trying to end a state that is not active.");
            }
            delete this.activeStates[stateId];
            this.doBeforeChangeState(nextState, args);
            this.activateState(nextState, this.transformStateResult(...args));
        });
    }
}