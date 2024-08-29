import DVector2 from "../../graphics3d/pub/DVector2";
import IController, { DStateUpdate, TProperties } from "./IController";
import IState from "./IState";

/**
 * Base class for all IController implementations.
 */
export default class Controller implements IController {
    targetState: IState<unknown>;
    extractStateProperties: DStateUpdate<TProperties> = {before: {}, after: {}};

    constructor() {
        
    }

    point(pointerPosition: DVector2, pointerIndex: number): DStateUpdate<unknown> {
        return this._doWithStateExtractions("point", () => {});
    }

    triggerPointer(buttonIndex: number, pointerIndex: number): DStateUpdate<unknown> {
        return this._doWithStateExtractions("triggerPointer", () => {});
    }

    changeDirection(direction: DVector2, directionControllerIndex: number): DStateUpdate<unknown> {
        return this._doWithStateExtractions("changeDirection", () => {});
    }

    pressKey(key: string, keyControllerIndex: number): DStateUpdate<unknown> {
        return this._doWithStateExtractions("pressKey", () => {});
    }

    releaseKey(key: string, keyControllerIndex: number): DStateUpdate<unknown> {
        return this._doWithStateExtractions("releaseKey", () => {});
    }

    /**
     * Performs the given function but does state extractions
     * before and after on .targetState according to the rules set in
     * .extractStateProperties.
     */
    protected _doWithStateExtractions(methodName: string, f: () => void) {
        if (this.targetState !== undefined) {
            const propertiesBefore = this.extractStateProperties.before[methodName];
            const propertiesAfter = this.extractStateProperties.after[methodName];
            const stateBefore = (propertiesBefore !== undefined && propertiesBefore.length > 0) ?
                this.targetState.extract(propertiesBefore) : {};
            f();
            const stateAfter = (propertiesAfter !== undefined && propertiesAfter.length > 0) ?
                this.targetState.extract(propertiesAfter) : {};
            return {before: stateBefore, after: stateAfter};
        } else {
            f();
            return {before: {}, after: {}};
        }
    }
}