import { Vector2, Vector3 } from "@babylonjs/core";
import IOwningState from "../../../../components/computation/pub/IOwningState";
import IState from "../../../../components/computation/pub/IState";
import IMovableState from "../../../../components/objects3d/pub/creatures/IMovableState";
import IRotatableState from "../../../../components/objects3d/pub/creatures/IRotatableState";
import RotateState from "../../../../components/objects3d/pub/creatures/RotateState";
import TStateResource from "../../../../components/objects3d/pub/creatures/TStateResource";
import IActionableState from "../../../../components/objects3d/pub/creatures/IActionableState";
import IActionModeState from "./IActionModeState";
import EventEmitter from "../../../../components/events/pub/EventEmitter";
import PermissionResourceStateMachine from "../../../../components/computation/pub/PermissionResourceStateMachine";
import { IPointable } from "../../../../components/graphics2d/pub/IPointable";
import Characterized from "../../../../components/classes/pub/Characterized";
import IObject from "../../../../components/objects3d/pub/IObject";
import MouseRotatable from "../../../../components/objects3d/pub/MouseRotatable";
import ITickable from "../../../../components/objects3d/pub/ITickable";
import MoveState from "../../../../components/objects3d/pub/creatures/MoveState";

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
        public stateMachine: PermissionResourceStateMachine<TStateResource>,
        public body: Characterized<IObject>
    ) {
        
    }
    
    doOnTick(time: number): ITickable {
        (this.stateMachine.states["run"] as MoveState).doOnTick(time);
        return this;
    }

    point(pointerPosition: { x: number; y: number; }): IPointable {
        // Redirect the point event as a rotation event.
        const angle = (this.body.as("MouseRotatable") as MouseRotatable).calculateAngle(
            new Vector2(pointerPosition.x, pointerPosition.y)
        );
        this.setAngle(angle); 
        return this;
    }

    triggerPointer(pointerPosition: { x: number; y: number; }, buttonIndex: number): IPointable {
        // Do nothing.
        return this;
    }
    
    start(): unknown {
        if (!this.isActive) {
            this.isActive = true;
            Object.keys(this.stateMachine.activeStates).forEach((stateId) => {
                if (!this.knownStates.includes(stateId)) {
                    this.stateMachine.deactivateState(stateId);
                }
            });
            this.stateMachine.activateState("idle");
        }
        return this;
    }

    end(): unknown {
        if (this.isActive) {
            this.isActive = false;
            return this;
        }
    }

    onEnd(callback: (nextStateId: string, ...args: unknown[]) => void): IState {
        this.emitter.on("end", callback);
        return this;
    }

    move(direction: Vector3): IMovableState {
        if (this.isActive) {
            // Try to redirect the action to the run state by default so it can attempt 
            // to take control of movement if it has permission to.
            this.redirectAction<IMovableState>("run", (state) => state.move(direction));
            
            const movementOwner = Object.values(this.stateMachine.activeStates)
                .find((s) => s.ownedResources.has("movement"));
            
            console.log(movementOwner);
            // If the run state does not have control of movement now, we should 
            // redirect the action to the state that does, since this means that the run state was not 
            // able to override it.
            if (movementOwner !== undefined && movementOwner !== this.stateMachine.states["run"]) {
                if ("move" in movementOwner) {
                    (movementOwner as IMovableState).move(direction);
                }
            }
        }
        return this;
    }

    setAngle(angle: number): IRotatableState {
        if (this.isActive) {
            return this.redirectAction<IRotatableState>("rotate", (state) => state.setAngle(angle));
        } else {
            return this;
        }
    }

    doMainAction(): IActionableState {
        // We have no main action.
        return this;
    }

    /**
     * Press a key that may result in special actions 
     * for the body.
     */
    pressFeatureKey(key: string) {
        // We do nothing.
        return this;
    }

    /**
     * Release a previously pressed down feature key.
     */
    releaseFeatureKey(key: string) {
        // We do nothing.
        return this;
    }

    /**
     * Redirect an action command (such as for example moving) to 
     * a state of choice if it is active. Otherwise, we wish to activate said state. 
     * Since this.stateMachine is a PermissionStateMachine then 
     * this transition will go through only if it has permission to.
     */
    redirectAction<TState>(stateId: string, doAction: (state: TState) => unknown) {
        const state = this.stateMachine.states[stateId] as unknown as TState & IOwningState<TStateResource>;
        if (state.ownedResources.size === state.wantedResources.size) {
            // If state has all the resources it wants 
            // then we can simply redirect the action to it.
            doAction(state);
        } else {
            // Otherwise, the state does not 
            // have some resources that it wants. In this case, 
            // we want to attempt to gain control of those 
            // resources.
            Object.keys(this.stateMachine.activeStates).forEach((activeStateId) => {
                if (activeStateId !== stateId) {
                    this.stateMachine.changeState(activeStateId, stateId, [new Set(Array.from(state.wantedResources))]);
                }
            });
            // If the state became active by gaining control 
            // of some resources it wants, then we can 
            // redirect the action to it. Otherwise, 
            // the state has no control of any resources, 
            // and thus it cannot do anything.
            if (state.isActive) {
                doAction(state);
            }
        }
        return this;
    }
}