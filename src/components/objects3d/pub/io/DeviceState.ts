import Vector3Utils from "../../../graphics3d/pub/Vector3Utils";
import Device from "../Device";
import DDeviceState from "./DDeviceState";
import IState from "./IState";
import ObjectState from "./ObjectState";

/**
 * Represents the state data of a Device that 
 * is useful for IO operations involving the Device.
 */
export default class DeviceState extends ObjectState implements IState<DDeviceState> {
    constructor(public target: Device) {
        super(target);
    }

    extract(properties: string[]): DDeviceState {
        const state: DDeviceState = super.extract(properties);
        properties.forEach((property: string) => {
            if (property === "perpetualMotionDirection") {
                state.perpetualMotionDirection = Vector3Utils.toObject(
                    this.target.perpetualMotionDirection);
            } else if (property === "perpetualMotionSpeed") {
                state.perpetualMotionSpeed = this.target.perpetualMotionSpeed
            }
        });
        return state;
    }

    inject(data: DDeviceState): void {
        
    }
}