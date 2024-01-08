import { Vector2 } from "@babylonjs/core";
import IDirectionController from "../../../controls/pub/IDirectionController";
import MouseRotatable from "../MouseRotatable";
import MeshLeash3D from "../../../graphics3d/pub/MeshLeash3D";
import EventEmitter from "../../../events/pub/EventEmitter";

/**
 * Adapts a MouseRotatable to the IDirectionController interface.
 */
export default class MouseRotatableController implements IDirectionController {
    emitter: EventEmitter = new EventEmitter();

    constructor(public rotatable: MouseRotatable) {
        this.rotatable.emitter.on("rotate", this._onRotate);
    }

    onDirectionChange(callback: (direction: Vector2) => void): void {
        this.emitter.on("rotate", callback);
    }

    offDirectionChange(callback: (direction: Vector2) => void): void {
        this.emitter.off("rotate", callback);
    }

    /**
     * When the MouseRotatable rotates.
     */
    _onRotate = (leash: MeshLeash3D) => {
        this.emitter.trigger("directionChange", [leash.lastLeash]);
    }
}