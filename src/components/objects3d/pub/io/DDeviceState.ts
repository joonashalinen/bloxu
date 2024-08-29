import DVector3 from "../../../graphics3d/pub/DVector3";
import DObjectState from "./DObjectState";

/**
 * A data object interface for a Device that describes
 * the Device's state as property values. Does not have to
 * match exactly with the properties of an Device, meaning
 * some properties of DDeviceState may require computation to extract from
 * Device.
 */
export default interface DDeviceState  extends DObjectState {
    perpetualMotionDirection?: DVector3;
    perpetualMotionSpeed?: number;
}