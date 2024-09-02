import IState, { TProperty } from "../../../controls/pub/IState";
import Vector3Utils from "../../../graphics3d/pub/Vector3Utils";
import Object3D from "../Object";
import DVector3 from "../../../graphics3d/pub/DVector3";

/**
 * A data object interface for an objects3d Object that describes
 * the Object's state as property values. Does not have to
 * match exactly with the properties of an Object, meaning
 * some properties of DObjectState may require computation to extract from
 * Object.
 */
export interface DObjectState {
    horizontalAngle?: number;
    absolutePosition?: DVector3;
}

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
    constructor(public target: Object3D) {
        
    }

    /**
     * Extract the requested state information from the object.
     */
    extract(properties: TProperty[]): DObjectState {
        const state: DObjectState = {};
        properties.forEach((property: TProperty) => {
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
        Object.keys(data).forEach((property: string) => {
            if (property === "horizontalAngle") {
                this.target.setHorizontalAngle(data.horizontalAngle);
            } else if (property === "absolutePosition") {
                this.target.transformNode.setAbsolutePosition(
                    Vector3Utils.fromObject(data.absolutePosition));
            }
        });
    }
}