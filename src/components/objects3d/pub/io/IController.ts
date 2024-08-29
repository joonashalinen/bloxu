import DVector2 from "../../../graphics3d/pub/DVector2";
import IState from "./IState";

export interface DStateUpdate<T> {
    before: T;
    after: T;
}

export type TProperties = { [controllerMethod: string]: string[]; };

/**
 * Handles inputs and controls something based on those inputs.
 */
export default interface IController {
    targetState: IState<unknown>;
    extractStateProperties: DStateUpdate<TProperties>;
    point(pointerPosition: DVector2): DStateUpdate<unknown>;
    move(direction: DVector2): DStateUpdate<unknown>;
    triggerPointer(buttonIndex: number): DStateUpdate<unknown>;
    pressFeatureKey(key: string): DStateUpdate<unknown>;
    releaseFeatureKey(key: string): DStateUpdate<unknown>;
}