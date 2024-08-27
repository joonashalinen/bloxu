import DVector2 from "../../../graphics3d/pub/DVector2";
import DUpdate from "./DUpdate";

/**
 * Handles inputs and controls something based on those inputs.
 */
export default interface IController {
    point(pointerPosition: DVector2): DUpdate<unknown>;
    move(direction: DVector2): DUpdate<unknown>;
    triggerPointer(buttonIndex: number): DUpdate<unknown>;
    pressFeatureKey(key: string): DUpdate<unknown>;
    releaseFeatureKey(key: string): DUpdate<unknown>;
}