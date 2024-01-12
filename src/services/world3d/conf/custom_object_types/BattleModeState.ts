import { Mesh, Vector3 } from "@babylonjs/core";
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
import JumpState from "../../../../components/objects3d/pub/creatures/JumpState";

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
        const jumpState = this.actionModeState.stateMachine.states["jump"] as JumpState;
        if (jumpState.isActive) {
            jumpState.doOnTick(time);
        }
        return this;
    }

    point(pointerPosition: { x: number; y: number; }): IPointable {
        this.actionModeState.point(pointerPosition);
        return this;
    }
    
    start(): unknown {
        if (!this.isActive) {
            this.actionModeState.start();
            this.equipGun();
        }
        return this;
    }
    
    end(): unknown {
        if (this.isActive) {
            this.actionModeState.end();
            this.unequipGun();
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
            if (this.actionModeState.stateMachine.resourceStateMachine.availableResources.has("mainAction")) {
                this.actionModeState.redirectAction<ShootState>("shoot", (state) => state.doMainAction());
            }
        }
        return this;
    }

    pressFeatureKey(key: string): BattleModeState {
        if (this.isActive) {
            if (key === "q") {
                this.end();
                this.actionModeState.emitter.trigger("end", ["build"]);
            } else if (key === " ") {
                this.actionModeState.redirectAction<JumpState>("jump", (state) => state.pressFeatureKey(key));
            }
        }
        return this;
    }

    releaseFeatureKey(key: string): BattleModeState {
        return this;
    }

    /**
     * Equip the gun on the main player character.
     */
    equipGun() {
        const shootState = this.actionModeState.stateMachine.states["shoot"] as ShootState;
        shootState.pistolMesh.attachToBone(
            shootState.character.skeleton.bones[23], 
            shootState.character.mesh.getChildren()[0] as Mesh
        );
        shootState.pistolMesh.setEnabled(true);
    }

    /**
     * Equip the gun on the main player character.
     */
    unequipGun() {
        const shootState = this.actionModeState.stateMachine.states["shoot"] as ShootState;
        shootState.pistolMesh.detachFromBone();
        shootState.pistolMesh.setEnabled(false);
    }
}