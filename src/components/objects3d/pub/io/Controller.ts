import DVector2 from "../../../graphics3d/pub/DVector2";
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

    point(pointerPosition: DVector2): DStateUpdate<unknown> {
        return this._doWithStateExtractions("point", () => {});
    }

    move(direction: DVector2): DStateUpdate<unknown> {
        return this._doWithStateExtractions("move", () => {});
    }

    triggerPointer(buttonIndex: number): DStateUpdate<unknown> {
        return this._doWithStateExtractions("triggerPointer", () => {});
    }

    pressFeatureKey(key: string): DStateUpdate<unknown> {
        return this._doWithStateExtractions("pressFeatureKey", () => {});
    }

    releaseFeatureKey(key: string): DStateUpdate<unknown> {
        return this._doWithStateExtractions("releaseFeatureKey", () => {});
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