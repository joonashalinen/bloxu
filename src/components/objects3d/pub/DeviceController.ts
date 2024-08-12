import ObjectController from "./ObjectController";
import Device from "./Device";
import { Vector3 } from "@babylonjs/core";
import DVector2 from "../../graphics3d/pub/DVector2";

/**
 * An input controller for a Device that is meant to 
 * provide different modes of controlling the Device.
 */
export default class DeviceController extends ObjectController {

    constructor(public device: Device) {
        super(device);
    }

    move(direction: DVector2): void {
        const direction3D = new Vector3(direction.x, 0, direction.y);
        this.device.setPerpetualMotionDirection(direction3D);
    }
}