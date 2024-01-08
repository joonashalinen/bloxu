import IState from "./IState";
import IStateMachine from "./IStateMachine";
import StateMachine from "./StateMachine";

/**
 * A state machine with set permissions 
 * for which states can override other states. 
 * The default implementation of IStateMachine (StateMachine) allows 
 * changing of states freely from any other state. 
 * Conversely, PermissionStateMachine only allows 
 * changing from a state to another (without the state itself having triggered a change 
 * to the other state) if permissions for such an override are set.
 */
export default class PermissionStateMachine
    <
        TState extends IState, 
        TStateMachine extends IStateMachine<TState>
    >
    implements IStateMachine<TState>
{
    overridePermissions: {[stateId: string]: string[]} = {};
    doBeforeChangeState: (nextStateId: string, ...args: unknown[]) => undefined;

    get transformStateResult(): (...args: unknown[]) => unknown[] {
        return this._stateMachine.transformStateResult;
    }
    set transformStateResult(f: (...args: unknown[]) => unknown[]) {
        this._stateMachine.transformStateResult = f;
    }

    get states() {
        return this._stateMachine.states;
    }
    set setStates(states: {[id: string]: TState}) {
        this._stateMachine.states = states;
    }

    get activeStates() {
        return this._stateMachine.activeStates;
    }
    set setActiveStates(states: {[id: string]: TState}) {
        this._stateMachine.activeStates = states;
    }

    constructor(
        private _stateMachine: TStateMachine
    ) {
        Object.keys(this._stateMachine.states).forEach((id) => this.overridePermissions[id] = []);
    }

    activateState(id: string, args: unknown[] = []): IStateMachine<TState> {
        this._stateMachine.activateState(id, args);
        return this;
    }

    deactivateState(id: string): IStateMachine<TState> {
        this._stateMachine.deactivateState(id);
        return this;
    }

    changeState(from: string, to: string, args: unknown[]): IStateMachine<TState> {
        const permissions = this.overridePermissions[to];
        if (permissions.includes(from)) {
            this._stateMachine.changeState(from, to, args);
        }
        return this;
    }
}