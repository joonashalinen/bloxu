import IState from "../../../controls/pub/IState";
import Vector3Utils from "../../../graphics3d/pub/Vector3Utils";
import Object from "../Object";
import DObjectState from "./DObjectState";

/**
 * Represents the state data of an objects3d Object.
 * Contains the computations needed for turning a
 * Object into a DObjectState and
 * for injecting state information from a
 * DObjectState to a Object. Useful for
 * IO where communicating about the state
 * of Objects is needed.
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