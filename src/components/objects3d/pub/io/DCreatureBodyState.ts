import DDeviceState from "./DDeviceState";

export default interface DCreatureBodyState  extends DDeviceState {
    selectedItemName?: string;
    activeStateName?: string;
}