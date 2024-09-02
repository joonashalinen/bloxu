import IState, { TProperty } from "../../../controls/pub/IState";
import PickerPlacer from "../items/PickerPlacer";
import Object3D from "../Object";
import ObjectManager from "../ObjectManager";
import ItemState, { DItemState } from "./ItemState";
import PickerState, { DPickerState } from "./PickerState";
import PlacerState, { DPlacerState } from "./PlacerState";

export interface DPickerPlacerState extends DItemState {
    pickerState?: DPickerState;
    placerState?: DPlacerState;
    ownedObjectIds?: string[];
}

/**
 * Represents the state of a PickerPlacer.
 */
export default class PickerPlacerState extends ItemState implements IState<DPickerPlacerState> {
    pickerState: PickerState;
    placerState: PlacerState;

    constructor(public target: PickerPlacer, public objectManager: ObjectManager) {
        super(target);
        this.pickerState = new PickerState(target.picker, objectManager);
        this.placerState = new PlacerState(target.placer, objectManager);
        // If the placer is in passive mode, the user of the PickerPlacer (us)
        // is responsible for calling .doAfterPlacing because normal .doOnTick
        // behavior of the PickerPlacer is disabled when the passive picker is equipped.
        if (this.target.placer.passiveModeEnabled) {
            this.target.placer.onPlace(() => { this.target.doAfterPlacing(); });
        }
    }

    extract(properties: TProperty[]): DPickerPlacerState {
        const data: DPickerPlacerState = super.extract(properties);
        properties.forEach((property) => {
            if (typeof property === "object") {
                if (property.name === "pickerState") {
                    data.pickerState = this.pickerState.extract(property.subProperties);
                } else if (property.name === "placerState") {
                    data.placerState = this.placerState.extract(property.subProperties);
                }
            } else {
                if (property === "ownedObjectIds") {
                    data.ownedObjectIds = Array.from(this.target.ownedObjects).map((o) => o.id);
                }
            }
        });
        return data;
    }

    inject(data: DPickerPlacerState): void {
        super.inject(data);
        Object.keys(data).forEach((property) => {
            if (property === "pickerState") {
                this.pickerState.inject(data.pickerState);
            } else if (property === "placerState") {
                this.placerState.inject(data.placerState);
            } else if (property === "ownedObjectIds") {
                const ownedObjects: Object3D[] = data.ownedObjectIds.map(
                    this.objectManager.getObject.bind(this.objectManager));
                const ownedObjectsSet: Set<Object3D> = new Set(ownedObjects);
                
                const lostObjects = Array.from(this.target.ownedObjects).filter((object) =>
                    !ownedObjectsSet.has(object));
                const gainedObjects = Array.from(ownedObjectsSet).filter((object) =>
                    !this.target.ownedObjects.has(object));

                lostObjects.forEach((object) => {this.target.releaseOwnership(object);});
                gainedObjects.forEach((object) => {this.target.takeOwnership(object);});

                this.target.ownedObjects = ownedObjectsSet;
            }
        });
    }
}