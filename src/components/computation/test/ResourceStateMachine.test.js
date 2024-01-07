"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var globals_1 = require("@jest/globals");
var ResourceStateMachine_1 = require("../pub/ResourceStateMachine");
var EventEmitter_1 = require("../../events/pub/EventEmitter");
var StateMachine_1 = require("../pub/StateMachine");
(0, globals_1.describe)('ResourceStateMachine', function () {
    function createMockState() {
        var MockState = /** @class */ (function () {
            function MockState() {
                var _this = this;
                this.ownedResources = new Set();
                this.emitter = new EventEmitter_1.default();
                this.wantedResources = new Set(["resource1", "resource2"]);
                this.isActive = false;
                this.start = globals_1.jest.fn(function (availableResources) {
                    _this.ownedResources = availableResources;
                    _this.isActive = true;
                    return availableResources;
                });
                this.end = globals_1.jest.fn(function () {
                    _this.isActive = false;
                    _this.ownedResources = new Set();
                    return _this.ownedResources;
                });
                this.onEnd = globals_1.jest.fn(function (callback) { return _this; });
                this.take = globals_1.jest.fn(function (resources) {
                    Array.from(resources).forEach(function (r) { return _this.ownedResources.delete(r); });
                    _this.isActive = false;
                    return resources;
                });
                this.give = globals_1.jest.fn(function (resources) {
                    Array.from(resources).forEach(function (r) { return _this.ownedResources.add(r); });
                    _this.isActive = true;
                    return resources;
                });
            }
            return MockState;
        }());
        var state = new MockState();
        return state;
    }
    // Mocks
    var mockState1;
    var mockState2;
    var allResources = new Set(['resource1', 'resource2']);
    var stateMachine;
    var resourceStateMachine;
    (0, globals_1.beforeEach)(function () {
        mockState1 = createMockState();
        mockState2 = createMockState();
        stateMachine = new StateMachine_1.default({ "state1": mockState1, "state2": mockState2 });
        resourceStateMachine = new ResourceStateMachine_1.default(stateMachine, allResources);
    });
    (0, globals_1.afterEach)(function () {
        globals_1.jest.clearAllMocks();
    });
    (0, globals_1.it)('should activate state when calling activateState on non-active state', function () {
        resourceStateMachine.activateState('state1');
        (0, globals_1.expect)(mockState1.start).toHaveBeenCalled();
        (0, globals_1.expect)(stateMachine.activeStates).toEqual({ "state1": mockState1 });
        (0, globals_1.expect)(Array.from(mockState1.ownedResources)).toEqual(["resource1", "resource2"]);
    });
    (0, globals_1.it)('should deactivate state', function () {
        resourceStateMachine.activateState('state1');
        resourceStateMachine.deactivateState('state1');
        (0, globals_1.expect)(mockState1.end).toHaveBeenCalled();
        (0, globals_1.expect)(stateMachine.activeStates).toEqual({});
        (0, globals_1.expect)(Array.from(mockState1.ownedResources)).toEqual([]);
    });
    (0, globals_1.it)('should change state', function () {
        mockState1.ownedResources = new Set(["resource1"]);
        resourceStateMachine.activeStates["state1"] = mockState1;
        resourceStateMachine.changeState('state1', 'state2', [['resource1']]);
        (0, globals_1.expect)(Array.from(mockState1.ownedResources)).toEqual([]);
        (0, globals_1.expect)(Array.from(mockState2.ownedResources)).toEqual(["resource1"]);
        (0, globals_1.expect)(mockState1.isActive).toEqual(false);
        (0, globals_1.expect)(mockState2.isActive).toEqual(true);
        (0, globals_1.expect)(resourceStateMachine.activeStates).toEqual({ "state2": mockState2 });
    });
    (0, globals_1.it)('should transfer resources', function () {
        mockState1.ownedResources = new Set(["resource1"]);
        resourceStateMachine.activeStates["state1"] = mockState1;
        resourceStateMachine.transferResources('state1', 'state2', new Set(['resource1']));
        (0, globals_1.expect)(Array.from(mockState1.ownedResources)).toEqual([]);
        (0, globals_1.expect)(Array.from(mockState2.ownedResources)).toEqual(["resource1"]);
        (0, globals_1.expect)(mockState1.take).toHaveBeenCalledWith(globals_1.expect.any(Set));
        (0, globals_1.expect)(mockState2.give).toHaveBeenCalledWith(globals_1.expect.any(Set));
        (0, globals_1.expect)(resourceStateMachine.activeStates).toEqual({ "state2": mockState2 });
    });
    (0, globals_1.it)('should take resources from all states', function () {
        mockState1.ownedResources = new Set(["resource1"]);
        resourceStateMachine.activeStates["state1"] = mockState1;
        resourceStateMachine.takeResourcesFromAll(new Set(['resource1', 'resource2']));
        (0, globals_1.expect)(stateMachine.activeStates).toEqual({});
        (0, globals_1.expect)(mockState1.take).toHaveBeenCalledWith(globals_1.expect.any(Set));
    });
    (0, globals_1.it)('should transfer resources from all states', function () {
        mockState1.ownedResources = new Set(["resource1"]);
        resourceStateMachine.activeStates["state1"] = mockState1;
        resourceStateMachine.transferResourcesFromAll('state2', new Set(['resource1', 'resource2']));
        (0, globals_1.expect)(Array.from(mockState1.ownedResources)).toEqual([]);
        (0, globals_1.expect)(Array.from(mockState2.ownedResources)).toEqual(["resource1", "resource2"]);
        (0, globals_1.expect)(mockState1.take).toHaveBeenCalledWith(globals_1.expect.any(Set));
        (0, globals_1.expect)(mockState2.give).toHaveBeenCalledWith(globals_1.expect.any(Set));
        (0, globals_1.expect)(resourceStateMachine.activeStates).toEqual({ "state2": mockState2 });
    });
    (0, globals_1.it)('should find owner of resource', function () {
        mockState1.ownedResources = new Set(['resource1']);
        resourceStateMachine.activeStates["state1"] = mockState1;
        var owner = resourceStateMachine.ownerOfResource('resource1');
        (0, globals_1.expect)(owner).toBe(mockState1);
    });
});
