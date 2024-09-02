import IState, { TProperty } from "../../../controls/pub/IState";
import Vector3Utils from "../../../graphics3d/pub/Vector3Utils";
import Device from "../Device";
import ObjectState, { DObjectState } from "./ObjectState";
import DVector3 from "../../../graphics3d/pub/DVector3";

/**
 * A data object interface for a Device that describes
 * the Device's state as property values. Does not have to
 * match exactly with the properties of an Device, meaning
 * some properties of DDeviceState may require computation to extract from
 * Device.
 */
export interface DDeviceState  extends DObjectState {
    perpetualMotionDirection?: DVector3;
    perpetualMotionSpeed?: number;
}

/**
 * Represents the state data of a Device.
 * Contains the computations needed for turning a
 * Device into a DDeviceState and
 * for injecting state information from a
 * DDeviceState to a Device. Useful for
 * IO where communicating about the state
 * of Devices is needed.
 */
export default class DeviceState extends ObjectState implements IState<DDeviceState> {
    constructor(public target: Device) {
        super(target);
    }

    extract(properties: TProperty[]): DDeviceState {
        const state: DDeviceState = super.extract(properties);
        properties.forEach((property: TProperty) => {
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
        Object.keys(data).forEach((property: string) => {
            if (property === "perpetualMotionDirection") {
                this.target.setPerpetualMotionDirection(
                    Vector3Utils.fromObject(data.perpetualMotionDirection));
            } else if (property === "perpetualMotionSpeed") {
                this.target.perpetualMotionSpeed = data.perpetualMotionSpeed;
            }
        });
        super.inject(data);
    }
}