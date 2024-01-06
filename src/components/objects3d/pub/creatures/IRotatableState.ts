
export function isIRotatableState(obj: Object): obj is IRotatableState {
    return "setAngle" in obj && "angle" in obj;
}

/**
 * A state for an object that can be rotated.
 */
export default interface IRotatableState {
    angle: number;
    setAngle(angle: number): IRotatableState;
}