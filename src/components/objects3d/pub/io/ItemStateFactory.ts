import IItem from "../items/IItem";
import ObjectManager from "../ObjectManager";
import ItemState from "./ItemState";
import PickerPlacerState from "./PickerPlacerState";
import PickerState from "./PickerState";
import PlacerState from "./PlacerState";

/**
 * A factory for creating ItemState instances.
 */
export default class ItemStateFactory {
    stateConstructors = {
        "Picker": PickerState,
        "Placer": PlacerState,
        "PickerPlacer": PickerPlacerState
    }

    constructor(public objectManager: ObjectManager) {
        
    }

    /**
     * Creates a new ItemState for an IItem instance.
     */
    createFor(item: IItem<unknown, unknown> & Object): ItemState | undefined {
        const constructor = this.stateConstructors[item.constructor.name];
        if (constructor !== undefined) {
            return new constructor(item, this.objectManager);
        } else {
            return undefined;
        }
    }
}