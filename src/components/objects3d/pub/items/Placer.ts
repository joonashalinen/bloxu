import { AbstractMesh, Vector3 } from "@babylonjs/core";
import Object from "../Object";
import IPlacer, { DPlacementInfo } from "./IPlacer";
import ObjectGrid from "../ObjectGrid";
import EventEmitter from "../../../events/pub/EventEmitter";
import Item from "./Item";
import Action from "../../../computation/pub/Action";
import Selector from "./Selector";

export interface DActionContext {
    objectWasInVoid: boolean;
    objectWasHeld: boolean;
    objectOriginalPosition: Vector3;
    selectionPosition: Vector3;
    heldObjects: Object[];
    objectGrid?: ObjectGrid;
}

/**
 * An item that can place objects.
 */
export default class Placer extends Item<Object, DActionContext> implements IPlacer {
    emitter: EventEmitter = new EventEmitter();
    heldObjects: Object[] = [];
    maxHeldObjects: number = 1;
    passiveModeEnabled: boolean = false;
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
        if (this.passiveModeEnabled) return;
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
        return (this.heldObjects !== undefined && this.heldObjects.length > 0);
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
        // into.
        if ((this.objectGrid !== undefined &&
            this.objectGrid.cellIsOccupiedAtPosition(this.selector.selectionPosition)) && 
            this.objectGrid.objectAtPosition(this.selector.selectionPosition) !== object) {
            this.emitter.trigger("useEnd");
            return false;
        }

        // Perform block placement in such a way that we support undo/redo.
        const objectWasHeld = this.heldObjects[this.heldObjects.length - 1] === object;
        const action = this.createPlaceAction(object, {
            objectWasInVoid: object.isInVoid,
            objectWasHeld: objectWasHeld,
            objectOriginalPosition: object.transformNode.getAbsolutePosition().clone(),
            selectionPosition: this.selector.selectionPosition.clone(),
            heldObjects: this.heldObjects,
            objectGrid: this.objectGrid
        });
        this.history.perform(action);

        // We don't currently support undo that would bring back the preview 
        // mesh. If this is needed, it can be implemented in the future.
        this.selector.deletePreviewMesh();

        this.emitter.trigger("place", [{
            object: object,
            absolutePosition: object.transformNode.getAbsolutePosition().clone(),
            objectWasHeld: objectWasHeld}]);
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
        this.emitter.trigger("undo");
    }

    /**
     * Replaces the last unplaced object.
     */
    redo() {
        const lastRedoable = this.history.redoableActions[this.history.redoableActions.length - 1];
        if (lastRedoable === undefined) return;
        if (lastRedoable.target.bringingBackFromTheVoid) return;
        this.history.redo();
        this.emitter.trigger("redo");
    }

    /**
     * Listen to 'place' events for when an object 
     * has been placed.
     */
    onPlace(callback: (info: DPlacementInfo) => void) {
        this.emitter.on("place", callback);
    }

    /**
     * Stop listening to 'place' events.
     */
    offPlace(callback: (info: DPlacementInfo) => void) {
        this.emitter.off("place", callback);
    }

    /**
     * Creates an Action object that performs object placing.
     */
    createPlaceAction(object: Object, context: DActionContext) {
        const doWith = (f: (object: Object, context: DActionContext) => void) =>
            (object: Object, context: DActionContext) => {
            f(object, context);
            if (context.objectWasInVoid) object.bringBackFromTheVoid();
            if (context.objectWasHeld) context.heldObjects.pop();
        };
        const undoWith = (f: (object: Object, context: DActionContext) => void) =>
            (object: Object, context: DActionContext) => {
            f(object, context);
            if (context.objectWasInVoid) object.teleportToVoid();
            if (context.objectWasHeld) context.heldObjects.push(object);
            object.setAbsolutePosition(context.objectOriginalPosition);
        };
        if (this.objectGrid !== undefined) {
            return new Action(object, context,
                doWith((object, context) => {
                    context.objectGrid.placeAtPosition(context.selectionPosition, object);
                }),
                undoWith((object, context) => {
                    context.objectGrid.clearCellAtPosition(context.selectionPosition);
                })
            );
        } else {
            return new Action(object, context,
                doWith((object, context) => {
                    object.transformNode.setAbsolutePosition(context.selectionPosition);
                }),
                undoWith((object, context) => {  })
            );
        }
    }
}