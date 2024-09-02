import DVector2 from "../../graphics3d/pub/DVector2";
import IState, { TProperty } from "./IState";

export interface DStateUpdate<T> {
    before: T;
    after: T;
}

export type TProperties = { [controllerMethod: string]: TProperty[]; };

/**
 * Handles inputs and controls something based on those inputs.
 */
export default interface IController {
    targetState: IState<unknown>;
    extractStateProperties: DStateUpdate<TProperties>;
    point(pointerPosition: DVector2, pointerIndex: number): DStateUpdate<unknown>;
    triggerPointer(buttonIndex: number, pointerIndex: number): DStateUpdate<unknown>;
    changeDirection(direction: DVector2, directionControllerIndex: number): DStateUpdate<unknown>;
    pressKey(key: string, keyControllerIndex: number): DStateUpdate<unknown>;
    releaseKey(key: string, keyControllerIndex: number): DStateUpdate<unknown>;
}