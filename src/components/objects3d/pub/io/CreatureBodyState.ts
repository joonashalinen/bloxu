import CreatureBody from "../creatures/CreatureBody";
import DCreatureBodyState from "./DCreatureBodyState";
import DeviceState from "./DeviceState";
import IState from "./IState";

/**
 * Represents the state data of a CreatureBody.
 * Contains the computations needed for turning a
 * CreatureBody into a DCreatureBodyState and
 * for injecting state information from a
 * DCreatureBodyState to a CreatureBody. Useful for
 * IO where communicating about the state
 * of CreatureBody objects is needed.
 */
export default class CreatureBodyState extends DeviceState implements IState<DCreatureBodyState> {
    constructor(public target: CreatureBody) {
        super(target);
    }

    extract(properties: string[]): DCreatureBodyState {
        const state: DCreatureBodyState = super.extract(properties);
        properties.forEach((property: string) => {
            if (property === "selectedItemName") {
                state.selectedItemName = this.target.selectedItemName;
            } else if (property === "activeStateName") {
                state.activeStateName = this.target.actionStateMachine.firstActiveState()?.name;
            }
        });
        return state;
    }

    inject(data: DCreatureBodyState): void {
        throw new Error("Method not implemented.");
    }
}