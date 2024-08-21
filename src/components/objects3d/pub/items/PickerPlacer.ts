import { AbstractMesh, Color3, HighlightLayer, StandardMaterial, Vector3 } from "@babylonjs/core";
import "@babylonjs/core/Rendering/outlineRenderer";
import Item from "../items/Item";
import ISelector, { DSelectInfo } from "./ISelector";
import Object from "../Object";
import IPlacer from "./IPlacer";

/**
 * An item that can pick objects and then place them.
 */
export default class PickerPlacer extends Item {
    heldObjects: Object[] = [];
    affectedObjects: Object[] = [];
    maxHeldObjects: number = 1;
    maxAffectedObjects: number = 1;
    overlayColor: Color3 = new Color3(0, 0, 1);
    overlayAlpha = 0.4;
    overlayPickedObjects: boolean = true;

    constructor(public picker: ISelector, public placer: IPlacer & ISelector) {
        super();
        // Set event listeners for the picker.
        this.picker.onSelect((info) => {
            if (info.object !== undefined) {
                if (this.canPick() && this.canPickObject(info.object)) {
                    info.object.teleportToVoid();
                    this.heldObjects.push(info.object);
                    this.picker.deactivate();
                    this.placer.activate();

                    if (this.overlayPickedObjects) {
                        // Show overlay for the picked object.
                        info.object.rootMesh().renderOverlay = true;
                        info.object.rootMesh().overlayAlpha = this.overlayAlpha;
                        info.object.rootMesh().overlayColor = this.overlayColor;
                    }

                    if (!this.affectedObjects.includes(info.object)) {
                        this.affectedObjects.push(info.object);
                    }

                    // Set preview mesh.
                    const previewMesh = (info.object.transformNode as AbstractMesh).clone(
                        "PickerPlacer:previewMesh?" + info.object.transformNode.name, null);
                    previewMesh.setEnabled(false);
                    previewMesh.getChildMeshes().at(0).visibility = 0.5;
                    this.placer.previewMesh = previewMesh;

                    this.emitter.trigger("pick", [info]);
                }
            }
        });
        this.picker.onItemUseEnded(() => {
            this.emitter.trigger("useEnd");
        });

        // Set event listeners for the placer.
        this.placer.onSelect((info) => {
            if (this.canPlace()) {
                this._placeHeldObject();
            }
        });
        this.placer.onItemUseEnded(() => {
            this.emitter.trigger("useEnd");
        });
    }

    public get transformNode() {
        if (this.canPick()) {
            return this.picker.transformNode;
        } else if (this.canPlace()) {
            return this.placer.transformNode;
        }
    }

    public get menu() {
        if (this.canPick()) {
            return this.picker.menu;
        } else if (this.canPlace()) {
            return this.placer.menu;
        }
    }

    public set aimedDirection(aimedDirection: Vector3) {
        this._aimedDirection = aimedDirection;
        if (this.picker !== undefined) this.picker.aimedDirection = aimedDirection;
    }

    /**
     * Whether we can use the picker.
     */
    canPick() {
        return this.heldObjects.length < this.maxHeldObjects;
    }

    /**
     * Whether we can pick the selected object.
     */
    canPickObject(object: Object) {
        return (this.affectedObjects.length < this.maxAffectedObjects || 
            this.affectedObjects.includes(object))
    }

    /**
     * Whether we can use the placer.
     */
    canPlace() {
        return this.heldObjects.length > 0;
    }

    doMainAction() {
        if (this.canPick()) {
            this.picker.doMainAction();
        } else if (this.canPlace()){
            this._placeHeldObject();
        }
    }

    doSecondaryAction() {
        if (this.canPick()) {
            this.picker.doSecondaryAction();
        } else if (this.canPlace()){
            this.placer.doSecondaryAction();
        }
    }

    /**
     * Listen to 'pick' events for when an object 
     * has been picked.
     */
    onPick(callback: (info: DSelectInfo) => void) {
        this.emitter.on("pick", callback);
    }

    /**
     * Stop listening to 'pick' events.
     */
    offPick(callback: (info: DSelectInfo) => void) {
        this.emitter.off("pick", callback);
    }

    doOnTick(passedTime: number, absoluteTime: number) {
        if (this.canPick()) {
            this.picker.doOnTick(passedTime, absoluteTime);
        } else if (this.canPlace()){
            this.placer.doOnTick(passedTime, absoluteTime);
        }
    }

    /**
     * Places the last held object using .placer.
     */
    private _placeHeldObject() {
        const object = this.heldObjects.pop();
        // If placing the object fails then we revert the attempt.
        if (!this.placer.placeObject(object)) {
            this.heldObjects.push(object);
            return;
        }
        // Delete the preview mesh.
        if (this.placer.previewMesh !== undefined) {
            this.placer.previewMesh.getScene().removeMesh(this.placer.previewMesh);
            this.placer.previewMesh.dispose();
        }

        this.placer.deactivate();
        this.picker.activate();
        const placeInfo: DSelectInfo = {
            object: object,
            absolutePosition: object.transformNode.absolutePosition
        };
        this.emitter.trigger("place", [placeInfo]);
    }
}