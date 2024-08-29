import DDeviceState from "./DDeviceState";

/**
 * A data object interface for a CreatureBody that describes
 * the CreatureBody's state as property values. Does not have to
 * match exactly with the properties of an CreatureBody, meaning
 * some properties of DCreatureBodyState may require computation to extract from
 * CreatureBody.
 */
export default interface DCreatureBodyState  extends DDeviceState {
    selectedItemName?: string;
    activeStateName?: string;
}