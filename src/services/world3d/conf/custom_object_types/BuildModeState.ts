import { MeshBuilder, Scene, Vector3 } from "@babylonjs/core";
import ShootState from "./ShootState";
import ActionModeState from "./ActionModeState";
import IActionableState from "../../../../components/objects3d/pub/creatures/IActionableState";
import IActionModeState from "./IActionModeState";
import RotateState from "../../../../components/objects3d/pub/creatures/RotateState";
import IMovableState from "../../../../components/objects3d/pub/creatures/IMovableState";
import IRotatableState from "../../../../components/objects3d/pub/creatures/IRotatableState";
import IState from "../../../../components/computation/pub/IState";
import MeshGrid from "../../../../components/objects3d/pub/MeshGrid";
import PlaceMeshInGridState from "./PlaceMeshInGridState";
import { IPointable } from "../../../../components/graphics2d/pub/IPointable";
import ITickable from "../../../../components/objects3d/pub/ITickable";

/**
 * State where the player's body is in building mode and 
 * cannot do combat. In build mode the player can place blocks.
 */
export default class BuildModeState implements IActionModeState {
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
        public baseId,
        public actionModeState: ActionModeState,
        public placeMeshState: PlaceMeshInGridState,
        public scene: Scene
    ) {
    }

    doOnTick(time: number): ITickable {
        this.actionModeState.doOnTick(time);
        this.placeMeshState.doOnTick(time);
        return this;
    }

    point(pointerPosition: { x: number; y: number; }): IPointable {
        this.actionModeState.point(pointerPosition);
        this.placeMeshState.point(pointerPosition);
        return this;
    }

    triggerPointer(pointerPosition: { x: number; y: number; }, buttonIndex: number): IPointable {
        this.placeMeshState.triggerPointer(pointerPosition, buttonIndex);
        return this
    }
    
    start(): unknown {
        if (!this.isActive) {
            this.actionModeState.start();
            this.placeMeshState.start();
        }
        return this;
    }
    
    end(): unknown {
        if (this.isActive) {
            this.actionModeState.end();
            this.placeMeshState.end();
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
            this.placeMeshState.doMainAction();
        }
        return this;
    }

    pressFeatureKey(key: string): BuildModeState {
        if (this.isActive) {
            if (key === "q") {
                this.end();
                this.actionModeState.emitter.trigger("end", ["battle"]);
            } else {
                this.placeMeshState.pressFeatureKey(key);
            }
        }
        return this;
    }

    releaseFeatureKey(key: string): BuildModeState {
        this.placeMeshState.releaseFeatureKey(key);
        return this;
    }
}