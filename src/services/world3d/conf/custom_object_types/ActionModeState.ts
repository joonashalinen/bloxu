import { Vector3 } from "@babylonjs/core";
import Characterized from "../../../../components/classes/pub/Characterized";
import StateMachine from "../../../../components/computation/pub/StateMachine";
import IOwningState from "../../../../components/computation/pub/IOwningState";
import IState from "../../../../components/computation/pub/IState";
import ResourceStateMachine from "../../../../components/computation/pub/ResourceStateMachine";
import AnimatedMovable from "../../../../components/objects3d/pub/AnimatedMovable";
import AnimatedRotatable from "../../../../components/objects3d/pub/AnimatedRotatable";
import IObject from "../../../../components/objects3d/pub/IObject";
import IMovableState, { isIMovableState } from "../../../../components/objects3d/pub/creatures/IMovableState";
import IRotatableState, { isIRotatableState } from "../../../../components/objects3d/pub/creatures/IRotatableState";
import IdleState from "../../../../components/objects3d/pub/creatures/IdleState";
import MoveState from "../../../../components/objects3d/pub/creatures/MoveState";
import RotateState from "../../../../components/objects3d/pub/creatures/RotateState";
import TStateResource from "../../../../components/objects3d/pub/creatures/TStateResource";
import { AnimatedMesh } from "../meshConstructors";
import IActionableState, { isIActionableState } from "../../../../components/objects3d/pub/creatures/IActionableState";
import IActionModeState from "./IActionModeState";
import OwningState from "../../../../components/computation/pub/OwningState";
import PermissionStateMachine from "../../../../components/computation/pub/PermissionStateMachine";
import EventEmitter from "../../../../components/events/pub/EventEmitter";

/**
 * Contains the common functionalities between different action 
 * mode states (such as BattleModeState and BuildModeState).
 */
export default class ActionModeState implements IActionModeState {
    isActive: boolean = false;
    emitter: EventEmitter = new EventEmitter();
    knownStates = ["run", "idle", "rotate"];

    get angle() {
        return (this.stateMachine.states["rotate"] as RotateState).rotatable.angle;
    }

    constructor(
        public stateMachine: PermissionStateMachine<
            IOwningState<TStateResource>,
            ResourceStateMachine<TStateResource>
        >
    ) {
    }
    
    start(): unknown {
        this.isActive = true;
        Object.keys(this.stateMachine.activeStates).forEach((stateId) => {
            if (!this.knownStates.includes(stateId)) {
                this.stateMachine.deactivateState(stateId);
            }
        });
        this.stateMachine.activateState("idle", ["animation"]);
        return this;
    }

    end(): unknown {
        this.isActive = false;
        return this;
    }

    onEnd(callback: (nextStateId: string, ...args: unknown[]) => void): IState {
        this.emitter.on("end", callback);
        return this;
    }

    move(direction: Vector3): IMovableState {
        return this.redirectAction<IMovableState>("run", (state) => state.move(direction));
    }

    setAngle(angle: number): IRotatableState {
        return this.redirectAction<IRotatableState>("rotate", (state) => state.setAngle(angle));
    }

    doMainAction(): IActionableState {
        // We have no main action.
        return this;
    }

    /**
     * Redirect an action command (such as for example moving) to 
     * a state of choice if it is active. Otherwise, we wish to activate said state. 
     * Since this.stateMachine is a PermissionStateMachine then 
     * this transition will go through only if it has permission to.
     */
    redirectAction<TState>(stateId: string, doAction: (state: TState) => unknown) {
        const state = this.stateMachine.activeStates[stateId] as unknown as TState & IOwningState<TStateResource>;
        if (stateId in this.stateMachine.activeStates) {
            doAction(state);
        } else {
            Object.keys(this.stateMachine.activeStates).forEach((stateId) => {
                if (stateId !== stateId) {
                    this.stateMachine.changeState(stateId, stateId, [state.wantedResources]);
                }
            });
        }
        return this;
    }
}