import DVector3 from "../../../graphics3d/pub/DVector3";
import DObjectState from "./DObjectState";

export default interface DDeviceState  extends DObjectState {
    perpetualMotionDirection?: DVector3;
    perpetualMotionSpeed?: number;
}