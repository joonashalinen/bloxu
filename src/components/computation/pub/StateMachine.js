"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * A (non-deterministic) finite state machine.
 */
var StateMachine = /** @class */ (function () {
    function StateMachine(states, startingStateId) {
        this.states = states;
        this.startingStateId = startingStateId;
        this.activeStates = {};
        this.transformStateResult = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return args;
        };
        this.doBeforeChangeState = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return undefined;
        };
        for (var id in states) {
            var state = states[id];
            this._listenToStateEnd(id, state);
        }
        if (startingStateId !== undefined) {
            this.activeStates[startingStateId] = states[startingStateId];
            this.activeStates[startingStateId].start();
        }
    }
    StateMachine.prototype.deactivateState = function (id) {
        var state = this.activeStates[id];
        if (state !== undefined) {
            delete this.activeStates[id];
            state.end();
        }
        return this;
    };
    StateMachine.prototype.changeState = function (from, to, args) {
        if (args === void 0) { args = []; }
        var fromState = this.states[from];
        if (fromState !== undefined) {
            var endResult = fromState.end();
            delete this.activeStates[from];
            this.doBeforeChangeState(to, [endResult]);
            this.activateState(to, this.transformStateResult([endResult]));
        }
        else {
            this.activateState(to, args);
        }
        return this;
    };
    /**
     * Start given state with given args.
     */
    StateMachine.prototype.activateState = function (id, args) {
        if (args === void 0) { args = []; }
        var state = this.states[id];
        this.activeStates[id] = state;
        state.start.apply(state, args);
        return this;
    };
    /**
     * Add a listener for a state ending itself on its own.
     */
    StateMachine.prototype._listenToStateEnd = function (stateId, state) {
        var _this = this;
        state.onEnd(function (nextState) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            delete _this.activeStates[stateId];
            _this.doBeforeChangeState(nextState, args);
            _this.activateState(nextState, _this.transformStateResult(args));
        });
    };
    return StateMachine;
}());
exports.default = StateMachine;
