import IState from "../../../computation/pub/IState";

export function isIActionableState(obj: Object): obj is IActionableState {
    return "doMainAction" in obj;
}

/**
 * A state for an object that has actions.
 */
export default interface IActionableState extends IState {
    doMainAction(): IActionableState;
}