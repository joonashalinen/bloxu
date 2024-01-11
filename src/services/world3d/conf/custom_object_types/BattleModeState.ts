import { Vector3 } from "@babylonjs/core";
import ShootState from "./ShootState";
import ActionModeState from "./ActionModeState";
import IActionableState from "../../../../components/objects3d/pub/creatures/IActionableState";
import IActionModeState from "./IActionModeState";
import RotateState from "../../../../components/objects3d/pub/creatures/RotateState";
import IMovableState from "../../../../components/objects3d/pub/creatures/IMovableState";
import IRotatableState from "../../../../components/objects3d/pub/creatures/IRotatableState";
import IState from "../../../../components/computation/pub/IState";
import { IPointable } from "../../../../components/graphics2d/pub/IPointable";
import ITickable from "../../../../components/objects3d/pub/ITickable";

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

    doOnTick(time: number): ITickable {
        this.actionModeState.doOnTick(time);
        return this;
    }

    point(pointerPosition: { x: number; y: number; }): IPointable {
        this.actionModeState.point(pointerPosition);
        return this;
    }
    
    start(): unknown {
        if (!this.isActive) {
            this.actionModeState.start();
        }
        return this;
    }
    
    end(): unknown {
        if (this.isActive) {
            this.actionModeState.end();
        }
        return this;
    }
    
    onEnd(callback: (nextStateId: string, ...args: unknown[]) => void): IState {
        this.actionModeState.onEnd(callback);
        return this;
    }
    
    move(direction: Vector3): IMovableState {
        if (this.isActive) {
            this.actionModeState.move(direction);
        }
        return this;
    }
    
    setAngle(angle: number): IRotatableState {
        if (this.isActive) {
            this.actionModeState.setAngle(angle);
        }
        return this;
    }
    
    doMainAction(): IActionableState {
        if (this.isActive) {
            this.actionModeState.redirectAction<ShootState>("shoot", (state) => state.doMainAction());
        }
        return this;
    }

    pressFeatureKey(key: string): BattleModeState {
        if (this.isActive) {
            if (key === "q") {
                this.end();
                this.actionModeState.emitter.trigger("end", ["build"]);
            }
        }
        return this;
    }

    releaseFeatureKey(key: string): BattleModeState {
        return this;
    }
}