import {describe, expect, test, jest, beforeEach, it} from '@jest/globals';
import StateMachine from "../pub/StateMachine";
import IState from "../pub/IState";

// Mock implementation of IState for testing purposes
class MockState implements IState {
    isActive: boolean = false;

    start = jest.fn((...args: unknown[]) => {
        this.isActive = true;
        return args;
    });

    end = jest.fn(() => {
        this.isActive = false;
        return "endArg";
    });

    onEnd(callback: (nextStateId: string, ...args: unknown[]) => void): IState {
        // Mock implementation, not needed for testing StateMachine
        return this;
    }
}

describe('StateMachine', () => {
    let stateMachine: StateMachine<MockState>;
    let states: { [id: string]: MockState };

    beforeEach(() => {
        states = {
            state1: new MockState(),
            state2: new MockState(),
            state3: new MockState(),
        };

        stateMachine = new StateMachine(states, 'state1');
    });

    it('should activate the starting state on construction', () => {
        expect(states.state1.isActive).toBeTruthy();
    });

    it('should deactivate a state', () => {
        stateMachine.deactivateState('state1');
        expect(states.state1.isActive).toBeFalsy();
    });

    it('should activate a new state', () => {
        stateMachine.changeState('state1', 'state2');
        expect(states.state1.isActive).toBeFalsy();
        expect(states.state2.isActive).toBeTruthy();
    });

    it('should activate a new state with given arguments', () => {
        const args = ['arg1', 'arg2'];
        stateMachine.changeState('nonexistentState', 'state2', args);
        expect(states.state1.isActive).toBeTruthy();
        expect(states.state2.isActive).toBeTruthy();
        expect(states.state2.start).toHaveBeenCalledWith(...args);
    });

    it('should activate a new state with arguments from ended state', () => {
        const args = ['arg1', 'arg2'];
        stateMachine.changeState('state1', 'state2', args);
        expect(states.state1.isActive).toBeFalsy();
        expect(states.state2.isActive).toBeTruthy();
        expect(states.state2.start).toHaveBeenCalledWith(["endArg"]);
    });

    it('should handle state transition with no "from" state', () => {
        stateMachine.changeState('nonexistentState', 'state2');
        expect(states.state2.isActive).toBeTruthy();
    });

    it('should invoke doBeforeChangeState before changing state', () => {
        const doBeforeChangeStateSpy = jest.spyOn(stateMachine, 'doBeforeChangeState');
        stateMachine.changeState('state1', 'state2');
        expect(doBeforeChangeStateSpy).toHaveBeenCalledWith('state2', expect.any(Array));
    });

    it('should invoke transformStateResult during state transition', () => {
        const transformStateResultSpy = jest.spyOn(stateMachine, 'transformStateResult');
        stateMachine.changeState('state1', 'state2');
        expect(transformStateResultSpy).toHaveBeenCalledWith(expect.any(Array));
    });

    it('should handle state activation with arguments', () => {
        const args = ['arg1', 'arg2'];
        stateMachine.activateState('state2', args);
        expect(states.state2.isActive).toBeTruthy();
        expect(states.state2.start).toHaveBeenCalledWith(...args);
    });
});
