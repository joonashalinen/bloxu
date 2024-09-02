import IState, { TProperty } from "../../../controls/pub/IState";
import CreatureBody from "../creatures/CreatureBody";
import ObjectManager from "../ObjectManager";
import DeviceState, { DDeviceState } from "./DeviceState";
import ItemState from "./ItemState";
import ItemStateFactory from "./ItemStateFactory";
import { DItemState } from "./ItemState";

/**
 * A data object interface for a CreatureBody that describes
 * the CreatureBody's state as property values. Does not have to
 * match exactly with the properties of an CreatureBody, meaning
 * some properties of DCreatureBodyState may require computation to extract from
 * CreatureBody.
 */
export interface DCreatureBodyState extends DDeviceState {
    selectedItemName?: string;
    activeStateName?: string;
    [name: `itemState:${string}`]: DItemState;
}

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
    itemStates: {[name: string]: ItemState} = {};

    constructor(public target: CreatureBody, public objectManager: ObjectManager) {
        super(target);
        const itemStateFactory = new ItemStateFactory(objectManager);
        Object.keys(target.items).forEach((itemName) => {
            const item = target.items[itemName];
            this.itemStates[itemName] = itemStateFactory.createFor(item);
        });
    }

    extract(properties: TProperty[]): DCreatureBodyState {
        const state: DCreatureBodyState = super.extract(properties) as DCreatureBodyState;
        properties.forEach((property: TProperty) => {
            if (typeof property === "object") {
                if (property.name.includes("itemState:")) {
                    const itemName = property.name.split(":")[1];
                    const itemState = this.itemStates[itemName];
                    state[property.name] = itemState.extract(property.subProperties);
                }
            } else {
                if (property === "selectedItemName") {
                    state.selectedItemName = this.target.selectedItemName;
                } else if (property === "activeStateName") {
                    state.activeStateName = this.target.actionStateMachine.firstActiveState()?.name;
                }
            }
        });
        return state;
    }

    inject(data: DCreatureBodyState): void {
        Object.keys(data).forEach((property: string) => {
            if (property === "selectedItemName" &&
                this.target.selectedItemName !== data.selectedItemName) {
                
                this.target.selectItem(data.selectedItemName);

            } else if (property === "activeStateName") {
                const activeStateName = this.target.actionStateMachine.firstActiveState()?.name;
                if (activeStateName !== data.activeStateName) {
                    this.target.actionStateMachine.changeState(
                        activeStateName !== undefined ? activeStateName : "", 
                        data.activeStateName);
                }
            } else if (property.includes("itemState:")) {
                const itemName = property.split(":")[1];
                const itemState = this.itemStates[itemName];
                itemState.inject(data[property]);
            }
        });
        super.inject(data);
    }
}