import { Vector2, Vector3 } from "@babylonjs/core";
import ShootState from "./ShootState";
import ActionModeState from "./ActionModeState";
import ResourcedStateMachine from "../../../../components/computation/pub/ResourceStateMachine";
import TStateResource from "../../../../components/objects3d/pub/creatures/TStateResource";
import IActionableState, { isIActionableState } from "../../../../components/objects3d/pub/creatures/IActionableState";
import IOwningState from "../../../../components/computation/pub/IOwningState";
import OwningState from "../../../../components/computation/pub/OwningState";
import IActionModeState from "./IActionModeState";
import RotateState from "../../../../components/objects3d/pub/creatures/RotateState";
import IMovableState from "../../../../components/objects3d/pub/creatures/IMovableState";
import IRotatableState from "../../../../components/objects3d/pub/creatures/IRotatableState";
import PermissionStateMachine from "../../../../components/computation/pub/PermissionStateMachine";
import IState from "../../../../components/computation/pub/IState";

/**
 * State where the player's body is battle-ready.
 */
export default class BattleModeState implements IActionModeState {
    get angle() {
        return (this.actionModeState.stateMachine.states["rotate"] as RotateState).rotatable.angle;
    }

    get isActive() {
        return this.actionModeState.isActive;
    }
    set setIsActive(isActive: boolean) {
        this.actionModeState.isActive = isActive;
    }

    constructor(
        public actionModeState: ActionModeState
    ) {
    }
    
    start(): unknown {
        this.actionModeState.start();
        return this;
    }
    
    end(): unknown {
        this.actionModeState.end();
        return this;
    }
    
    onEnd(callback: (nextStateId: string, ...args: unknown[]) => void): IState {
        this.actionModeState.onEnd(callback);
        return this;
    }
    
    move(direction: Vector3): IMovableState {
        this.actionModeState.move(direction);
        return this;
    }
    
    setAngle(angle: number): IRotatableState {
        this.actionModeState.setAngle(angle);
        return this;
    }
    
    doMainAction(): IActionableState {
        this.actionModeState.redirectAction<ShootState>("shoot", (state) => state.doMainAction());
        return this;
    }
}