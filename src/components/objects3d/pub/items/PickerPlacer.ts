import { Vector3 } from "@babylonjs/core";
import "@babylonjs/core/Rendering/outlineRenderer";
import Item from "../items/Item";
import ISelector, { DSelectInfo } from "./ISelector";
import Object from "../Object";
import IPlacer from "./IPlacer";
import IPicker from "./IPicker";
import Action from "../../../computation/pub/Action";

/**
 * An item that can pick objects and then place them.
 */
export default class PickerPlacer extends Item {
    linkedPickerPlacers: Set<PickerPlacer> = new Set();
    ownedObjects: Set<Object> = new Set();
    maxOwnedObjects: number = 1;
    paintOwnedObject: (object: Object) => void;
    unpaintOwnedObject: (object: Object) => void;
    private _selectedItem: "picker" | "placer" = "picker";
    private _redoing = false;
    private _ownershipChangeListeners: {[objectId: string]: (method: string) => void} = {};

    constructor(public picker: IPicker, public placer: IPlacer) {
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
                this.picker.deactivate();
                this.placer.activate();
                this._selectedItem = "placer";
                
                if (!this.ownedObjects.has(info.object)) this._takeOwnership(info.object);
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
        } else if (this.placer.canPlaceHeldObject()){
            this._placeHeldObject();
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
        
        if (lastUndoable !== undefined) {
            this.placer.undo();
            this.picker.undo();

            // If the object is no longer in the undoable history at all
            // we should release ownership of it.
            if (this.placer.history.undoableActions
                .find((action) => action.target === lastUndoable.target) === undefined) {
                this._releaseOwnership(lastUndoable.target);
            }
        }
    }

    /**
     * Redo the last undone sequence of picking up and placing an object.
     */
    redo() {
        if (this._selectedItem !== "picker") return;

        this._redoing = true;
        const lastRedoable = this.placer.history.redoableActions
            [this.placer.history.redoableActions.length - 1];

        if (lastRedoable !== undefined) {
            const affectedObjectWasInUndoHistory = this.placer.history.undoableActions
                .find((action) => action.target === lastRedoable.target) !== undefined;

            this.picker.redo();
            this.picker.heldObjects.pop();
            this.placer.redo();

            // If the object affected by the redo was previously not in the
            // undoable history but now is again then we should reclaim ownership of it.
            if (!affectedObjectWasInUndoHistory) {
                this._takeOwnership(lastRedoable.target);
            }
        }
        this._redoing = false;
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
     * Places the last held object using .placer.
     */
    private _placeHeldObject() {
        if (this.placer.placeHeldObject()) {
            this.picker.heldObjects.pop();
            this.placer.deactivate();
            this.picker.activate();
            this._selectedItem = "picker";
        }
    }

    /**
     * Take ownership of an object we don't own.
     */
    private _takeOwnership(object: Object) {
        if (this.paintOwnedObject !== undefined) {
            this.paintOwnedObject(object);
        }

        // If any of the linked PickerPlacers own the object, we want to copy their 
        // undo/redo history for the object.
        this.linkedPickerPlacers.forEach((other) => {
            if (other.ownedObjects.has(object)) {
                const p = (action: Action<Object>) => action.target === object;
                this.picker.history.redoableActions.push(...(other.picker.history.redoableActions.filter(p)));
                this.picker.history.undoableActions.push(...(other.picker.history.undoableActions.filter(p)));
                this.placer.history.redoableActions.push(...(other.placer.history.redoableActions.filter(p)));
                this.placer.history.undoableActions.push(...(other.placer.history.undoableActions.filter(p)));
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
                const f = (action: Action<Object>) => action.target !== object;
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
    private _releaseOwnership(object: Object) {
        if (this.unpaintOwnedObject !== undefined) {
            this.unpaintOwnedObject(object);
        }
        this.ownedObjects.delete(object);
        object.offChangeState(this._ownershipChangeListeners[object.id]);
        delete this._ownershipChangeListeners[object.id];
    }
}