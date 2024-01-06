"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var globals_1 = require("@jest/globals");
var StateMachine_1 = require("../pub/StateMachine");
// Mock implementation of IState for testing purposes
var MockState = /** @class */ (function () {
    function MockState() {
        var _this = this;
        this.isActive = false;
        this.start = globals_1.jest.fn(function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            _this.isActive = true;
            return args;
        });
        this.end = globals_1.jest.fn(function () {
            _this.isActive = false;
            return "endArg";
        });
    }
    MockState.prototype.onEnd = function (callback) {
        // Mock implementation, not needed for testing StateMachine
        return this;
    };
    return MockState;
}());
(0, globals_1.describe)('StateMachine', function () {
    var stateMachine;
    var states;
    (0, globals_1.beforeEach)(function () {
        states = {
            state1: new MockState(),
            state2: new MockState(),
            state3: new MockState(),
        };
        stateMachine = new StateMachine_1.default(states, 'state1');
    });
    (0, globals_1.it)('should activate the starting state on construction', function () {
        (0, globals_1.expect)(states.state1.isActive).toBeTruthy();
    });
    (0, globals_1.it)('should deactivate a state', function () {
        stateMachine.deactivateState('state1');
        (0, globals_1.expect)(states.state1.isActive).toBeFalsy();
    });
    (0, globals_1.it)('should activate a new state', function () {
        stateMachine.changeState('state1', 'state2');
        (0, globals_1.expect)(states.state1.isActive).toBeFalsy();
        (0, globals_1.expect)(states.state2.isActive).toBeTruthy();
    });
    (0, globals_1.it)('should activate a new state with given arguments', function () {
        var _a;
        var args = ['arg1', 'arg2'];
        stateMachine.changeState('nonexistentState', 'state2', args);
        (0, globals_1.expect)(states.state1.isActive).toBeTruthy();
        (0, globals_1.expect)(states.state2.isActive).toBeTruthy();
        (_a = (0, globals_1.expect)(states.state2.start)).toHaveBeenCalledWith.apply(_a, args);
    });
    (0, globals_1.it)('should activate a new state with arguments from ended state', function () {
        var args = ['arg1', 'arg2'];
        stateMachine.changeState('state1', 'state2', args);
        (0, globals_1.expect)(states.state1.isActive).toBeFalsy();
        (0, globals_1.expect)(states.state2.isActive).toBeTruthy();
        (0, globals_1.expect)(states.state2.start).toHaveBeenCalledWith(["endArg"]);
    });
    (0, globals_1.it)('should handle state transition with no "from" state', function () {
        stateMachine.changeState('nonexistentState', 'state2');
        (0, globals_1.expect)(states.state2.isActive).toBeTruthy();
    });
    (0, globals_1.it)('should invoke doBeforeChangeState before changing state', function () {
        var doBeforeChangeStateSpy = globals_1.jest.spyOn(stateMachine, 'doBeforeChangeState');
        stateMachine.changeState('state1', 'state2');
        (0, globals_1.expect)(doBeforeChangeStateSpy).toHaveBeenCalledWith('state2', globals_1.expect.any(Array));
    });
    (0, globals_1.it)('should invoke transformStateResult during state transition', function () {
        var transformStateResultSpy = globals_1.jest.spyOn(stateMachine, 'transformStateResult');
        stateMachine.changeState('state1', 'state2');
        (0, globals_1.expect)(transformStateResultSpy).toHaveBeenCalledWith(globals_1.expect.any(Array));
    });
    (0, globals_1.it)('should handle state activation with arguments', function () {
        var _a;
        var args = ['arg1', 'arg2'];
        stateMachine.activateState('state2', args);
        (0, globals_1.expect)(states.state2.isActive).toBeTruthy();
        (_a = (0, globals_1.expect)(states.state2.start)).toHaveBeenCalledWith.apply(_a, args);
    });
});
