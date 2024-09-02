import Action from "../../../computation/pub/Action";
import IState, { TProperty } from "../../../controls/pub/IState";
import Picker from "../items/Picker";
import Object3D from "../Object";
import ObjectManager from "../ObjectManager";
import ItemState, { DItemState } from "./ItemState";

export interface DPickerState extends DItemState {
    heldObjectIds?: string[];
}

/**
 * Represents the state of a Picker.
 */
export default class PickerState extends ItemState implements IState<DPickerState> {
    newUndoRedos: ("undo" | "redo")[] = [];

    constructor(public target: Picker, public objectManager: ObjectManager) {
        super(target);
        this.createDataAction = (action: Action<Object3D, Picker>) => action.target.id;
        this.getHistoryTargetFromId = this.objectManager.getObject.bind(this.objectManager);
        this.createActionFromHistoryTarget = this.target.createPickAction.bind(this.target);
    }

    extract(properties: TProperty[]): DPickerState {
        const data: DPickerState = super.extract(properties);
        properties.forEach((property) => {
            if (property === "heldObjectIds") {
                data.heldObjectIds = this.target.heldObjects.map((object) => object.id);
            }
        });
        return data;
    }

    inject(data: DPickerState): void {
        super.inject(data);
        Object.keys(data).forEach((property) => {
            if (property === "heldObjectIds") {
                const heldObjects: Object3D[] = data.heldObjectIds.map(
                    this.objectManager.getObject.bind(this.objectManager));
                const heldObjectsSet: Set<Object3D> = new Set(heldObjects);
                const removedObjects = this.target.heldObjects.filter((object) =>
                    !heldObjectsSet.has(object));

                removedObjects.forEach((object) => {object.bringBackFromTheVoid();});
                heldObjects.forEach((object) => {
                    object.teleportToVoid();
                    this.target.paintPickedObject(object);
                });

                this.target.heldObjects = heldObjects;
            }
        });
    }
}