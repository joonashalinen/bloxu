import {describe, expect, test, jest, beforeEach, it, afterEach} from '@jest/globals';
import ResourceStateMachine from '../pub/ResourceStateMachine';
import IOwningState from '../pub/IOwningState';
import EventEmitter from '../../events/pub/EventEmitter';
import StateMachine from '../pub/StateMachine';

describe('ResourceStateMachine', () => {
    function createMockState(): IOwningState<string> {
        class MockState implements IOwningState<string> {
            ownedResources = new Set<string>();
            emitter = new EventEmitter();
            wantedResources = new Set<string>(["resource1", "resource2"]);
            isActive = false;
            start = jest.fn((availableResources: Set<string>) => {
                this.ownedResources = availableResources;
                this.isActive = true;
                return availableResources;
            });
            end = jest.fn(() => {
                this.isActive = false;
                this.ownedResources = new Set();
                return this.ownedResources;
            });
            onEnd = jest.fn((callback: (nextStateId: string, freedResources: Set<string>) => void) => this);
            take = jest.fn((resources: Set<string>) => {
                Array.from(resources).forEach((r) => this.ownedResources.delete(r))
                this.isActive = false;
                return resources;
            });
            give = jest.fn((resources: Set<string>) => {
                Array.from(resources).forEach((r) => this.ownedResources.add(r))
                this.isActive = true;
                return resources;
            });
        }

        const state = new MockState();

        return state;
    }

    // Mocks
    let mockState1: IOwningState<string>;
    let mockState2: IOwningState<string>;

    const allResources: Set<string> = new Set(['resource1', 'resource2']);

    let stateMachine: StateMachine<IOwningState<string>>;
    let resourceStateMachine: ResourceStateMachine<string>;

    beforeEach(() => {
        mockState1 = createMockState();
        mockState2 = createMockState();
        resourceStateMachine = new ResourceStateMachine(
            {"state1": mockState1, "state2": mockState2}, 
            allResources
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should activate state when calling activateState on non-active state', () => {
        resourceStateMachine.activateState('state1');

        expect(mockState1.start).toHaveBeenCalled();
        expect(stateMachine.activeStates).toEqual({"state1": mockState1});
        expect(Array.from(mockState1.ownedResources)).toEqual(["resource1", "resource2"]);
    });

    it('should deactivate state', () => {
        resourceStateMachine.activateState('state1');
        resourceStateMachine.deactivateState('state1');

        expect(mockState1.end).toHaveBeenCalled();
        expect(stateMachine.activeStates).toEqual({});
        expect(Array.from(mockState1.ownedResources)).toEqual([]);
    });

    it('should change state', () => {
        mockState1.ownedResources = new Set(["resource1"]);
        resourceStateMachine.activeStates["state1"] = mockState1;
        resourceStateMachine.changeState('state1', 'state2', [['resource1']]);

        expect(Array.from(mockState1.ownedResources)).toEqual([]);
        expect(Array.from(mockState2.ownedResources)).toEqual(["resource1"]);
        expect(mockState1.isActive).toEqual(false);
        expect(mockState2.isActive).toEqual(true);
        expect(resourceStateMachine.activeStates).toEqual({"state2": mockState2});
    });

    it('should transfer resources', () => {
        mockState1.ownedResources = new Set(["resource1"]);
        resourceStateMachine.activeStates["state1"] = mockState1;
        resourceStateMachine.transferResources('state1', 'state2', new Set(['resource1']));

        expect(Array.from(mockState1.ownedResources)).toEqual([]);
        expect(Array.from(mockState2.ownedResources)).toEqual(["resource1"]);
        expect(mockState1.take).toHaveBeenCalledWith(expect.any(Set));
        expect(mockState2.give).toHaveBeenCalledWith(expect.any(Set));
        expect(resourceStateMachine.activeStates).toEqual({"state2": mockState2});
    });

    it('should take resources from all states', () => {
        mockState1.ownedResources = new Set(["resource1"]);
        resourceStateMachine.activeStates["state1"] = mockState1;
        resourceStateMachine.takeResourcesFromAll(new Set(['resource1', 'resource2']));

        expect(stateMachine.activeStates).toEqual({});
        expect(mockState1.take).toHaveBeenCalledWith(expect.any(Set));
    });

    it('should transfer resources from all states', () => {
        mockState1.ownedResources = new Set(["resource1"]);
        resourceStateMachine.activeStates["state1"] = mockState1;
        resourceStateMachine.transferResourcesFromAll('state2', new Set(['resource1', 'resource2']));

        expect(Array.from(mockState1.ownedResources)).toEqual([]);
        expect(Array.from(mockState2.ownedResources)).toEqual(["resource1", "resource2"]);
        expect(mockState1.take).toHaveBeenCalledWith(expect.any(Set));
        expect(mockState2.give).toHaveBeenCalledWith(expect.any(Set));
        expect(resourceStateMachine.activeStates).toEqual({"state2": mockState2});
    });

    it('should find owner of resource', () => {
        mockState1.ownedResources = new Set(['resource1']);
        resourceStateMachine.activeStates["state1"] = mockState1;
        const owner = resourceStateMachine.ownerOfResource('resource1');

        expect(owner).toBe(mockState1);
    });
});
