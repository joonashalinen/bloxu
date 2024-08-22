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
    ownedObjects: Object[] = [];
    maxOwnedObjects: number = 1;
    paintOwnedObject: (object: Object) => void;
    unpaintOwnedObject: (object: Object) => void;

    constructor(public picker: ISelector, public placer: IPlacer & ISelector) {
        super();
        // Set event listeners for the picker.
        this.picker.onSelect((info) => {
            if (info.object !== undefined) {
                if (this.canPick() && this.canPickObject(info.object)) {

                    info.object.teleportToVoid();
                    this.placer.heldObjects.push(info.object);
                    this.picker.deactivate();
                    this.placer.activate();

                    if (this.paintOwnedObject !== undefined) {
                        this.paintOwnedObject(info.object);
                    }
                    
                    if (!this.ownedObjects.includes(info.object)) {
                        // Take ownership of the object.
                        this.ownedObjects.push(info.object);
                        info.object.changeOwnership(this.ownerId);
                        // Listen to when someone might steal ownership away, in 
                        // which case we release ownership of the object.
                        const ownershipChangeListener = (methodName: string) => {
                            if (methodName === "changeOwnership") {
                                info.object.offChangeState(ownershipChangeListener);
                                this.ownedObjects.splice(this.ownedObjects.indexOf(info.object), 1);
                            }
                        };
                        info.object.onChangeState(ownershipChangeListener);
                    }

                    this.placer.setPreviewMeshFromObject(info.object);
                    this.emitter.trigger("pick", [info]);
                }
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
        if (this.canPick()) {
            return this.picker.transformNode;
        } else if (this.placer.canPlaceHeldObject()) {
            return this.placer.transformNode;
        }
    }

    public get menu() {
        if (this.canPick()) {
            return this.picker.menu;
        } else if (this.placer.canPlaceHeldObject()) {
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
        return this.placer.heldObjects.length < this.placer.maxHeldObjects;
    }

    /**
     * Whether we can pick the selected object.
     */
    canPickObject(object: Object) {
        return (this.ownedObjects.length < this.maxOwnedObjects || 
            this.ownedObjects.includes(object))
    }

    doMainAction() {
        if (this.canPick()) {
            this.picker.doMainAction();
        } else if (this.placer.canPlaceHeldObject()){
            this._placeHeldObject();
        }
    }

    doSecondaryAction() {
        if (this.canPick()) {
            this.picker.doSecondaryAction();
        } else if (this.placer.canPlaceHeldObject()){
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
        } else if (this.placer.canPlaceHeldObject()){
            this.placer.doOnTick(passedTime, absoluteTime);
        }
    }

    /**
     * Places the last held object using .placer.
     */
    private _placeHeldObject() {
        if (this.placer.placeHeldObject()) {
            this.placer.deactivate();
            this.picker.activate();
        }
    }
}