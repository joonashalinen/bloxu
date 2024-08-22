import { AbstractMesh, Vector3 } from "@babylonjs/core";
import Object from "../Object";
import IPlacer, { TMeshMapper } from "./IPlacer";
import ISelector from "./ISelector";
import Selector from "./Selector";
import ObjectGrid from "../ObjectGrid";

/**
 * An item that can place objects.
 */
export default class Placer extends Selector implements IPlacer, ISelector {
    previewMesh: AbstractMesh;
    placementPosition: Vector3;
    heldObjects: Object[] = [];
    maxHeldObjects: number = 1;
    preview: TMeshMapper =  (mesh) => {mesh.visibility = 1; return mesh;};
    unpreview: TMeshMapper = (mesh) => {mesh.visibility = 0.5; return mesh;};
    getObjectToPlace: () => Object;

    constructor(public objectGrid: ObjectGrid = undefined) {
        super();
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
                this.heldObjects.pop();
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    placeObject(object: Object): boolean {
        if (this.placementPosition === undefined) {
            this.emitter.trigger("useEnd");
            return false;
        }
        
        // We do not allow placing if the possible associated
        // object grid already has an object placed at the cell we are about to place
        // into. Note: the coordinates of .grid are local to the possible object followed by
        // GridMenu, whereas the coordinates of .objectGrid are absolute.
        if ((this.objectGrid !== undefined &&
            this.objectGrid.cellIsOccupiedAtPosition(this.placementPosition))) {
            this.emitter.trigger("useEnd");
            return false;
        }
        
        if (this.objectGrid !== undefined) {
            this.objectGrid.placeAtPosition(this.placementPosition, object);
        } else {
            object.transformNode.setAbsolutePosition(this.placementPosition);
        }
        if (object.isInVoid) object.bringBackFromTheVoid();

        // Delete the preview mesh.
        if (this.previewMesh !== undefined) {
            this.previewMesh.getScene().removeMesh(this.previewMesh);
            this.previewMesh.dispose();
        }

        this.emitter.trigger("select", [{
            object: object,
            absolutePosition: object.transformNode.absolutePosition.clone()}]);
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
        // Set preview mesh.
        const previewMesh = (object.transformNode as AbstractMesh).clone(
            "Placer:previewMesh?" + object.transformNode.name, null);
        previewMesh.setEnabled(false);
        previewMesh.getChildMeshes().at(0).visibility = 0.5;
        this.previewMesh = previewMesh;
    }
}