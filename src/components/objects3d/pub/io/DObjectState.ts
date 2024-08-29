import DVector3 from "../../../graphics3d/pub/DVector3";

/**
 * A data object interface for an objects3d Object that describes
 * the Object's state as property values. Does not have to
 * match exactly with the properties of an Object, meaning
 * some properties of DObjectState may require computation to extract from
 * Object.
 */
export default interface DObjectState {
    horizontalAngle?: number;
    absolutePosition?: DVector3;
}