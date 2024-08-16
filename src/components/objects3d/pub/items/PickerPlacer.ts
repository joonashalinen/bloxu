import { AbstractMesh, Vector3 } from "@babylonjs/core";
import Item from "../creatures/Item";
import ISelector, { DSelectInfo } from "./ISelector";
import Object from "../Object";
import IPlacer from "./IPlacer";

/**
 * An item that can pick objects and then place them.
 */
export default class PickerPlacer extends Item {
    heldObjects: Object[] = [];
    maxHeldObjects: number = 1;

    constructor(public picker: ISelector, public placer: IPlacer & ISelector) {
        super();
        // Set event listeners for the picker.
        this.picker.onSelect((info) => {
            if (info.object !== undefined) {
                if (this.canPick()) {
                    info.object.teleportToVoid();
                    this.heldObjects.push(info.object);
                    this.picker.deactivate();
                    this.placer.activate();
                    const previewMeshName = "PickerPlacer:previewMesh?" + info.object.transformNode.name;
                    if (this.placer.previewMesh === undefined ||
                        this.placer.previewMesh.name !== previewMeshName) {
                        const previewMesh = (info.object.transformNode as AbstractMesh).clone(
                            "PickerPlacer:previewMesh?" + info.object.transformNode.name, null);
                        previewMesh.setEnabled(false);
                        previewMesh.getChildMeshes().at(0).visibility = 0.5;
                        this.placer.previewMesh = previewMesh;
                    }
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

    public get menu() {
        if (this.canPick()) {
            return this.picker.menu;
        } else if (this.canPlace()) {
            return this.placer.menu;
        }
        return undefined;
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
        if (!this.placer.placeObject(object)) {
            this.heldObjects.push(object);
            return;
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