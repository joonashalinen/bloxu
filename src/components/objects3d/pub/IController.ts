import DVector2 from "../../graphics3d/pub/DVector2";

/**
 * Handles inputs and controls something based on those inputs.
 */
export default interface IController {
    point(pointerPosition: DVector2): void;
    move(direction: DVector2): void;
    triggerPointer(buttonIndex: number): void;
    pressFeatureKey(key: string): void;
    releaseFeatureKey(key: string): void;
}