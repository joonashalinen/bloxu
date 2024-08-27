import Vector3Utils from "../../../graphics3d/pub/Vector3Utils";
import Object from "../Object";
import DObjectState from "./DObjectState";
import IState from "./IState";

/**
 * Represents the state data of an Object. Useful 
 * for IO operations where we need the communicate about 
 * the state of Objects.
 */
export default class ObjectState implements IState<DObjectState> {
    constructor(public target: Object) {
        
    }

    /**
     * Extract the requested state information from the object.
     */
    extract(properties: string[]): DObjectState {
        const state: DObjectState = {};
        properties.forEach((property: string) => {
            if (property === "horizontalAngle") {
                state.horizontalAngle = this.target.horizontalAngle();
            } else if (property === "absolutePosition") {
                state.absolutePosition = Vector3Utils.toObject(
                    this.target.transformNode.getAbsolutePosition());
            }
        });
        return state;
    }

    /**
     * Sets the given state information for the Object.
     */
    inject(data: DObjectState) {
        
    }
}