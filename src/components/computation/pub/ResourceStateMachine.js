"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * A non-deterministic state machine that owns resources and gives
 * exclusive control of them to the active states.
 */
var ResourceStateMachine = /** @class */ (function () {
    function ResourceStateMachine(_stateMachine, allResources) {
        var _this = this;
        this._stateMachine = _stateMachine;
        this.allResources = allResources;
        this.doBeforeChangeState = function () { return undefined; };
        this.availableResources = allResources;
        _stateMachine.doBeforeChangeState = function (nextStateId) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var freedResources = args[0];
            freedResources.forEach(function (r) { return _this.availableResources.add(r); });
            _this.doBeforeChangeState(nextStateId, args);
        };
    }
    Object.defineProperty(ResourceStateMachine.prototype, "transformStateResult", {
        get: function () {
            return this._stateMachine.transformStateResult;
        },
        set: function (f) {
            this._stateMachine.transformStateResult = f;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ResourceStateMachine.prototype, "states", {
        get: function () {
            return this._stateMachine.states;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ResourceStateMachine.prototype, "setStates", {
        set: function (states) {
            this._stateMachine.states = states;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ResourceStateMachine.prototype, "activeStates", {
        get: function () {
            return this._stateMachine.activeStates;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ResourceStateMachine.prototype, "setActiveStates", {
        set: function (states) {
            this._stateMachine.activeStates = states;
        },
        enumerable: false,
        configurable: true
    });
    ResourceStateMachine.prototype.changeState = function (from, to, args) {
        var resources = args[0];
        this.transferResources(from, to, resources);
        return this;
    };
    ResourceStateMachine.prototype.activateState = function (id) {
        if (!(id in this._stateMachine.activeStates)) {
            this._stateMachine.activateState(id, [this.availableResources]);
        }
        return this;
    };
    ResourceStateMachine.prototype.deactivateState = function (id) {
        var _this = this;
        var state = this._stateMachine.states[id];
        state.ownedResources.forEach(function (r) { return _this.availableResources.add(r); });
        this._stateMachine.deactivateState(id);
        return this;
    };
    /**
     * Takes control of the given resources from one state and gives
     * them to another.
     */
    ResourceStateMachine.prototype.transferResources = function (fromStateId, toStateId, resources) {
        this.takeResources(fromStateId, resources);
        this.giveResources(toStateId, resources);
    };
    /**
     * Free the specified resources from the given state.
     */
    ResourceStateMachine.prototype.takeResources = function (stateId, resources) {
        var _this = this;
        var state = this.activeStates[stateId];
        var freedResources = state.take(resources);
        freedResources.forEach(function (r) { return _this.availableResources.add(r); });
        // If the state no longer has any resources, 
        // we want to deactivate it, since it is not doing anything 
        // anyway.
        if (state.ownedResources.size === 0) {
            this._stateMachine.deactivateState(stateId);
        }
    };
    /**
     * Give the specified resources to the given state
     * or a subset of them if not all of them are available.
     */
    ResourceStateMachine.prototype.giveResources = function (stateId, resources) {
        var _this = this;
        var state = this.states[stateId];
        var availableToGive = new Set(Array.from(resources).filter(function (resource) {
            return _this.availableResources.has(resource);
        }));
        var givenResources = state.give(availableToGive);
        givenResources.forEach(function (r) { return _this.availableResources.delete(r); });
        // If we gave resources to the state, then 
        // it becomes active if it was no already.
        if (givenResources.size !== 0 && !(stateId in this.activeStates)) {
            this.activeStates[stateId] = this.states[stateId];
        }
        return givenResources;
    };
    /**
     * Take away the specified resources from all
     * active states.
     */
    ResourceStateMachine.prototype.takeResourcesFromAll = function (resources) {
        var _this = this;
        var takenResources = __spreadArray([], Object.keys(this.activeStates), true).map(function (stateId) {
            return _this.takeResources(stateId, resources);
        });
        return new Set(takenResources.flat(1));
    };
    /**
     * Gather the specified resources from all active states
     * and give them to the specified state.
     */
    ResourceStateMachine.prototype.transferResourcesFromAll = function (toStateId, resources) {
        this.takeResourcesFromAll(resources);
        return this.giveResources(toStateId, resources);
    };
    /**
     * Find who has control of the given resource.
     * If no one does, then returns undefined.
     */
    ResourceStateMachine.prototype.ownerOfResource = function (resource) {
        return Object.values(this.activeStates).find(function (state) {
            return state.ownedResources.has(resource);
        });
    };
    return ResourceStateMachine;
}());
exports.default = ResourceStateMachine;
