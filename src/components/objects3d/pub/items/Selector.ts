import { AbstractMesh, AnimationGroup, Vector3 } from "@babylonjs/core";
import Item from "../items/Item";
import ISelector, { DSelectInfo, TMeshMapper } from "./ISelector";

/**
 * Base class for ISelector implementations.
 */
export default class Selector extends Item<Object, Selector> implements ISelector {
    previewMesh: AbstractMesh;
    selectionPosition: Vector3;
    preview: TMeshMapper =  (mesh) => {mesh.visibility = 1; return mesh;};
    unpreview: TMeshMapper = (mesh) => {mesh.visibility = 0.5; return mesh;};

    constructor(useAnimation?: AnimationGroup) {
        super(useAnimation);
    }

    onSelect(callback: (info: DSelectInfo) => void): void {
        this.emitter.on("select", callback);
    }

    offSelect(callback: (info: DSelectInfo) => void): void {
        this.emitter.off("select", callback);
    }

    /**
     * Destroys the mesh that was set as a preview highlighting
     * the currently contemplated selection.
     */
    deletePreviewMesh() {
        if (this.previewMesh !== undefined) {
            this.previewMesh.getScene().removeMesh(this.previewMesh);
            this.previewMesh.dispose();
        }
    }
}