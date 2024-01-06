import { Vector3 } from "@babylonjs/core";
import IState from "../../../computation/pub/IState";

export function isIMovableState(obj: Object): obj is IMovableState {
    return "move" in obj;
}

/**
 * A state for an object that can be moved.
 */
export default interface IMovableState extends IState {
    move(direction: Vector3): IMovableState;
}