import { AbstractMesh, Vector3 } from "@babylonjs/core";
import Object from "../Object";
import IPlacer from "./IPlacer";
import ISelector, { DSelectInfo } from "./ISelector";
import ObjectGrid from "../ObjectGrid";
import EventEmitter from "../../../events/pub/EventEmitter";
import Item from "./Item";
import Action from "../../../computation/pub/Action";
import IItem from "./IItem";
import Selector from "./Selector";

/**
 * An item that can place objects.
 */
export default class Placer extends Item<Object, Placer> implements IPlacer {
    emitter: EventEmitter = new EventEmitter();
    heldObjects: Object[] = [];
    maxHeldObjects: number = 1;
    getObjectToPlace: () => Object;
    public get transformNode() {return this.selector.transformNode};
    public get menu() {return this.selector.menu};

    constructor(public selector: Selector, public objectGrid: ObjectGrid = undefined) {
        super();
    }

    activate(): void {
        super.activate();
        this.selector.activate();
    }

    deactivate(): void {
        super.deactivate();
        this.selector.deactivate();
    }

    doMainAction() {
        if (this.getObjectToPlace !== undefined) {
            this.placeObject(this.getObjectToPlace());
        } else if (this.canPlaceHeldObject()) {
            this.placeHeldObject();
        } else {
            this.emitter.trigger("useEnd");
        }
    }

    /**
     * Whether there is an object held by the placer that we can place.
     */
    canPlaceHeldObject() {
        return (this.heldObjects !== undefined && this.heldObjects.length > 0 &&
            this.heldObjects.length > 0);
    }

    /**
     * Places the the most recent object held.
     */
    placeHeldObject(): boolean {
        if (this.canPlaceHeldObject()) {
            if (this.placeObject(this.heldObjects[this.heldObjects.length - 1])) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    placeObject(object: Object): boolean {
        if (this.selector.selectionPosition === undefined) {
            this.emitter.trigger("useEnd");
            return false;
        }
        
        // We do not allow placing if the possible associated
        // object grid already has an object placed at the cell we are about to place
        // into. Note: the coordinates of .grid are local to the possible object followed by
        // GridMenu, whereas the coordinates of .objectGrid are absolute.
        if ((this.objectGrid !== undefined &&
            this.objectGrid.cellIsOccupiedAtPosition(this.selector.selectionPosition))) {
            this.emitter.trigger("useEnd");
            return false;
        }

        // Perform block placement in such a way that we support undo/redo.
        const objectWasInVoid = object.isInVoid;
        const objectWasHeld = this.heldObjects[this.heldObjects.length - 1] === object;
        const objectOriginalPosition = object.transformNode.getAbsolutePosition().clone();
        const selectionPosition = this.selector.selectionPosition.clone();
        const doWith = (f: (object: Object, context: Placer) => void) => (object: Object, context: Placer) => {
            f(object, context);
            if (objectWasInVoid) object.bringBackFromTheVoid();
            if (objectWasHeld) context.heldObjects.pop();
        };
        const undoWith = (f: (object: Object, context: Placer) => void) => (object: Object, context: Placer) => {
            f(object, context);
            if (objectWasInVoid) object.teleportToVoid();
            if (objectWasHeld) context.heldObjects.push(object);
            object.setAbsolutePosition(objectOriginalPosition);
        };
        if (this.objectGrid !== undefined) {
            this.history.perform(new Action(object, this,
                doWith((object, context) => { context.objectGrid.placeAtPosition(selectionPosition, object); }),
                undoWith((object, context) => { context.objectGrid.clearCellAtPosition(selectionPosition); })
            ));
        } else {
            this.history.perform(new Action(object, this,
                doWith((object, context) => { object.transformNode.setAbsolutePosition(selectionPosition); }),
                undoWith((object, context) => {  })
            ));
        }

        // We don't currently support undo that would bring back the preview 
        // mesh. If this is needed, it can be implemented in the future.
        this.selector.deletePreviewMesh();

        this.emitter.trigger("place", [{
            object: object,
            absolutePosition: object.transformNode.absolutePosition.clone()}]);
        this.emitter.trigger("useEnd");

        return true;
    }

    /**
     * Sets the current preview mesh to a clone of the given object's root mesh.
     */
    setPreviewMeshFromObject(object: Object) {
        const previewMesh = (object.transformNode as AbstractMesh).clone(
            "Placer:previewMesh?" + object.transformNode.name, null);
        previewMesh.setEnabled(false);
        previewMesh.getChildMeshes().at(0).visibility = 0.5;
        this.selector.previewMesh = previewMesh;
    }

    doOnTick(passedTime: number, absoluteTime: number) {
        this.selector.doOnTick(passedTime, absoluteTime);
    }

    /**
     * Unplaces the last placed object.
     */
    undo() {
        const lastUndoable = this.history.undoableActions[this.history.undoableActions.length - 1];
        if (lastUndoable === undefined) return;
        if (lastUndoable.target.bringingBackFromTheVoid) return;
        this.history.undo();
    }

    /**
     * Replaces the last unplaced object.
     */
    redo() {
        const lastRedoable = this.history.redoableActions[this.history.redoableActions.length - 1];
        if (lastRedoable === undefined) return;
        if (lastRedoable.target.bringingBackFromTheVoid) return;
        this.history.redo();
    }

    /**
     * Listen to 'place' events for when an object 
     * has been placed.
     */
    onPlace(callback: (info: DSelectInfo) => void) {
        this.emitter.on("place", callback);
    }

    /**
     * Stop listening to 'place' events.
     */
    offPlace(callback: (info: DSelectInfo) => void) {
        this.emitter.off("place", callback);
    }
}