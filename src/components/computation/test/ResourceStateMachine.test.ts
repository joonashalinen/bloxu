import {describe, expect, test, jest, beforeEach, it, afterEach} from '@jest/globals';
import ResourceStateMachine from '../pub/ResourceStateMachine';

describe('ResourceStateMachine', () => {
    // Mocks
    const mockState: any = {
        isActive: true,
        start: jest.fn(),
        end: jest.fn(),
        onEnd: jest.fn(() => mockState),
        take: jest.fn(),
        give: jest.fn(),
        ownedResources: new Set(),
    };

    const mockStateMachine: any = {
        activeStates: {},
        states: {
            state1: mockState,
            state2: mockState,
        },
        activateState: jest.fn(() => mockStateMachine),
        deactivateState: jest.fn(() => mockStateMachine),
        changeState: jest.fn(() => mockStateMachine),
        transformStateResult: jest.fn(),
        doBeforeChangeState: jest.fn(),
    };

    const allResources: Set<string> = new Set(['resource1', 'resource2', 'resource3']);

    let resourceStateMachine: ResourceStateMachine<string>;

    beforeEach(() => {
        resourceStateMachine = new ResourceStateMachine(mockStateMachine, allResources);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should activate state', () => {
        resourceStateMachine.activateState('state1');

        expect(mockStateMachine.activateState).toHaveBeenCalledWith('state1', expect.any(Array));
        expect(mockState.start).toHaveBeenCalled();
    });

    it('should deactivate state', () => {
        resourceStateMachine.deactivateState('state1');

        expect(mockStateMachine.deactivateState).toHaveBeenCalledWith('state1');
        expect(mockState.end).toHaveBeenCalled();
    });

    it('should change state', () => {
        resourceStateMachine.changeState('state1', 'state2', ['resources']);

        expect(mockStateMachine.changeState).toHaveBeenCalledWith('state1', 'state2', ['resources']);
        expect(mockState.end).toHaveBeenCalled();
        expect(mockState.start).toHaveBeenCalled();
    });

    it('should transfer resources', () => {
        resourceStateMachine.transferResources('state1', 'state2', new Set(['resource1']));

        expect(mockState.take).toHaveBeenCalledWith(expect.any(Set));
        expect(mockState.give).toHaveBeenCalledWith(expect.any(Set));
    });

    it('should take resources from all states', () => {
        resourceStateMachine.takeResourcesFromAll(new Set(['resource1', 'resource2']));

        expect(mockStateMachine.activeStates).toEqual({});
        expect(mockState.take).toHaveBeenCalledWith(expect.any(Set));
    });

    it('should transfer resources from all states', () => {
        resourceStateMachine.transferResourcesFromAll('state2', new Set(['resource1', 'resource2']));

        expect(mockStateMachine.activeStates).toEqual({});
        expect(mockState.take).toHaveBeenCalledWith(expect.any(Set));
        expect(mockState.give).toHaveBeenCalledWith(expect.any(Set));
    });

    it('should find owner of resource', () => {
        mockState.ownedResources = new Set(['resource1']);
        const owner = resourceStateMachine.ownerOfResource('resource1');

        expect(owner).toBe(mockState);
    });
});
