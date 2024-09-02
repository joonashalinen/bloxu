import { Vector3 } from "@babylonjs/core";
import "@babylonjs/core/Rendering/outlineRenderer";
import Item from "../items/Item";
import ISelector, { DSelectInfo } from "./ISelector";
import Object from "../Object";
import Action from "../../../computation/pub/Action";
import History from "../../../data_structures/pub/History";
import IItem from "./IItem";
import Placer, { DActionContext as DPlacerActionContext} from "./Placer";
import Picker from "./Picker";

/**
 * An item that can pick objects and then place them.
 */
export default class PickerPlacer extends Item<Object, Picker | Placer> {
    linkedPickerPlacers: Set<PickerPlacer> = new Set();
    ownedObjects: Set<Object> = new Set();
    maxOwnedObjects: number = 1;
    unpaintOwnedObject: (object: Object) => void = (object) => {};
    private _selectedItem: "picker" | "placer" = "picker";
    private _redoing = false;
    private _ownershipChangeListeners: {[objectId: string]: (method: string) => void} = {};

    public get paintOwnedObject() { return this.picker.paintPickedObject; }
    public set paintOwnedObject(paint: (object: Object) => void) {
        this.picker.paintPickedObject = paint;
    }

    constructor(public picker: Picker, public placer: Placer) {
        super();
        this.picker.canPickObject = (object) => (
            this.ownedObjects.size < this.maxOwnedObjects || 
            this.ownedObjects.has(object)
        );
        // Set event listeners for the picker.
        this.picker.onPick((info) => {
            if (this._redoing) return;
            if (info.object !== undefined) {
                this.placer.heldObjects.push(info.object);
                this.switchToPlacer();
                
                if (!this.ownedObjects.has(info.object)) this.takeOwnership(info.object);
                this.placer.setPreviewMeshFromObject(info.object);
            }
        });
        this.picker.onItemUseEnded(() => {
            this.emitter.trigger("useEnd");
        });

        // Set event listeners for the placer.
        this.placer.onItemUseEnded(() => {
            this.emitter.trigger("useEnd");
        });
    }

    public get transformNode() {
        if (this._selectedItem === "picker") {
            return this.picker.transformNode;
        } else if (this.placer.canPlaceHeldObject()) {
            return this.placer.transformNode;
        }
    }

    public get menu() {
        if (this._selectedItem === "picker") {
            return this.picker.menu;
        } else if (this.placer.canPlaceHeldObject()) {
            return this.placer.menu;
        }
    }

    public set aimedDirection(aimedDirection: Vector3) {
        this._aimedDirection = aimedDirection;
        if (this.picker !== undefined) this.picker.aimedDirection = aimedDirection;
    }

    activate(): void {
        if (this.isActive) return;
        super.activate();
        if (this._selectedItem === "picker") {
            this.picker.activate();
        } else {
            this.placer.activate();
        }
    }

    deactivate(): void {
        if (!this.isActive) return;
        super.deactivate();
        if (this._selectedItem === "picker") {
            this.picker.deactivate();
        } else {
            this.placer.deactivate();
        }
    }

    doMainAction() {
        if (this._selectedItem === "picker") {
            this.picker.doMainAction();
        } else if (this.placer.canPlaceHeldObject() && !this.placer.passiveModeEnabled){
            this.placeHeldObject();
        }
    }

    doSecondaryAction() {
        if (this._selectedItem === "picker") {
            this.picker.doSecondaryAction();
        } else if (this.placer.canPlaceHeldObject()){
            this.placer.doSecondaryAction();
        }
    }

    doOnTick(passedTime: number, absoluteTime: number) {
        if (this._selectedItem === "picker") {
            this.picker.doOnTick(passedTime, absoluteTime);
        } else if (this.placer.canPlaceHeldObject()){
            this.placer.doOnTick(passedTime, absoluteTime);
        }
    }

    /**
     * Undoes the last sequence of picking up and placing an object.
     */
    undo() {
        if (this._selectedItem !== "picker") return;

        const lastUndoable = this.placer.history.undoableActions
            [this.placer.history.undoableActions.length - 1];

        if (lastUndoable === undefined) return;
        if (lastUndoable.target.bringingBackFromTheVoid) return;

        this.placer.undo();
        this.picker.undo();

        // If the object is no longer in the undoable history at all
        // we should release ownership of it.
        if (this.placer.history.undoableActions
            .find((action) => action.target === lastUndoable.target) === undefined) {
            this.releaseOwnership(lastUndoable.target);
        }
        this.emitter.trigger("undo");
    }

    /**
     * Redo the last undone sequence of picking up and placing an object.
     */
    redo() {
        if (this._selectedItem !== "picker") return;

        const lastRedoable = this.placer.history.redoableActions
        [this.placer.history.redoableActions.length - 1];
        
        if (lastRedoable === undefined) return;
        if (lastRedoable.target.bringingBackFromTheVoid) return;
        
        this._redoing = true;

        const affectedObjectWasInUndoHistory = this.placer.history.undoableActions
            .find((action) => action.target === lastRedoable.target) !== undefined;

        this.picker.redo();
        this.picker.heldObjects.pop();
        this.placer.redo();

        // If the object affected by the redo was previously not in the
        // undoable history but now is again then we should repaint it and
        // reclaim ownership of it.
        if (!affectedObjectWasInUndoHistory) this.takeOwnership(lastRedoable.target);
        
        this._redoing = false;
        this.emitter.trigger("redo");
    }

    /**
     * Enable the PickerPlacer to communicate undo/redo history with
     * the given PickerPlacers.
     */
    linkWith(pickerPlacers: Set<PickerPlacer>) {
        pickerPlacers.forEach((pickerPlacer) => {
            pickerPlacer.linkedPickerPlacers.add(this);
            this.linkedPickerPlacers.add(pickerPlacer);
        });
    }

    /**
     * Take ownership of an object we don't own.
     */
    takeOwnership(object: Object) {
        // If any of the linked PickerPlacers own the object, we want to copy their 
        // undo/redo history for the object.
        this.linkedPickerPlacers.forEach((other) => {
            if (other.ownedObjects.has(object)) {
                const p = (action: Action<Object, Picker | DPlacerActionContext>) =>
                    action.target === object;

                ["picker", "placer"].forEach((item) =>
                    ["undoableActions", "redoableActions"].forEach((actions) => {
                        const copiedHistory = (
                            (other[item].history as History<Object, Picker | DPlacerActionContext>)
                            [actions] as Action<Object, Picker | DPlacerActionContext>[]
                        ).filter(p);
                        // We need to reassign some of the context properties because
                        // it is different now that we own the action.
                        copiedHistory.forEach((action) => {
                            action.context.heldObjects = (this[item] as Picker | Placer)
                                .heldObjects;
                            if (item === "picker") { (action.context as Picker) = this.picker };
                        });

                        ((this[item].history as History<Object, Picker | DPlacerActionContext>)
                            [actions] as Action<Object, Picker | DPlacerActionContext>[])
                            .push(...copiedHistory);
                    })
                );
            }
        });

        this.ownedObjects.add(object);
        object.changeOwnership(this.ownerId);
        // Listen to when someone might steal ownership away, in 
        // which case we release ownership of the object.
        const ownershipChangeListener = (methodName: string) => {
            if (methodName === "changeOwnership") {
                object.offChangeState(ownershipChangeListener);
                this.ownedObjects.delete(object);
                delete this._ownershipChangeListeners[object.id];
                // We also remove all undo/redo history of the released object.
                const f = (action: Action<Object, Picker | DPlacerActionContext>) => action.target !== object;
                this.picker.history.redoableActions = this.picker.history.redoableActions.filter(f);
                this.picker.history.undoableActions = this.picker.history.undoableActions.filter(f);
                this.placer.history.redoableActions = this.placer.history.redoableActions.filter(f);
                this.placer.history.undoableActions = this.placer.history.undoableActions.filter(f);
            }
        };
        
        if (this._ownershipChangeListeners[object.id] !== undefined) {
            throw new Error(`An ownership change event listener
                already exists with the same id as the 
                object unowned by PickerPlacer that we are attempting take ownership of.
                Two different objects that PickerPlacer is dealing with likely have the same id.`);
        }
        this._ownershipChangeListeners[object.id] = ownershipChangeListener;
        object.onChangeState(ownershipChangeListener);
    }

    /**
     * Release ownership of an object that we own.
     */
    releaseOwnership(object: Object) {
        this.unpaintOwnedObject(object);
        this.ownedObjects.delete(object);
        object.offChangeState(this._ownershipChangeListeners[object.id]);
        delete this._ownershipChangeListeners[object.id];
    }

    /**
     * Switches to the picker as the currently selected item.
     */
    switchToPicker() {
        this.placer.deactivate();
        this.picker.activate();
        this._selectedItem = "picker";
    }

    /**
     * Switches to the placer as the currently selected item.
     */
    switchToPlacer() {
        this.picker.deactivate();
        this.placer.activate();
        this._selectedItem = "placer";
    }

    /**
     * Places the last held object using .placer.
     */
    placeHeldObject() {
        if (this.placer.placeHeldObject()) {
            this.doAfterPlacing();
        }
    }

    /**
     * What the PickerPlacer does after placing an object.
     * This method is made public for classes that wish to 
     * have fine-grained control over the PickerPlacer, such
     * as PickerPlacerState.
     */
    doAfterPlacing() {
        const object = this.picker.heldObjects.pop();
        this.switchToPicker();
        this.emitter.trigger("place", [object]);
    }

    /**
     * Listens to the 'place' event, which is triggered whenever
     * the PickerPlacer places an object.
     */
    onPlace(callback: (object: Object) => void) {
        this.emitter.on("place", callback);
    }

    offPlace(callback: (object: Object) => void) {
        this.emitter.off("place", callback);
    }
}