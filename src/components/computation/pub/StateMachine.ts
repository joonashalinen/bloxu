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
    
    deactivateState(id: string): IStateMachine<TState> {
        const state = this.activeStates[id];
        if (state !== undefined) {
            delete this.activeStates[id];
            state.end();
        }
        return this;
    }

    changeState(from: string, to: string, args: unknown[] = []) {
        const fromState = this.states[from];

        if (fromState !== undefined) {
            const endResult = fromState.end();
            delete this.activeStates[from];

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
        const state = this.states[id];
        this.activeStates[id] = state;
        state.start(...args);
        return this;
    }

    /**
     * Add a listener for a state ending itself on its own.
     */
    private _listenToStateEnd(stateId: string, state: TState) {
        state.onEnd((nextState: string, ...args: unknown[]) => {
            delete this.activeStates[stateId];
            this.doBeforeChangeState(nextState, args);
            this.activateState(nextState, this.transformStateResult(args));
        });
    }
}