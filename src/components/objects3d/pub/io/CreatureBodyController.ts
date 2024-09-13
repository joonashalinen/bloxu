import { Vector2 } from "@babylonjs/core";
import DVector2 from "../../../graphics3d/pub/DVector2";
import DeviceController from "./DeviceController";
import CreatureBody from "../creatures/CreatureBody";
import CreatureBodyState from "./CreatureBodyState";
import ObjectManager from "../ObjectManager";

/**
 * An input controller for a CreatureBody that is meant to 
 * provide different modes of controlling the CreatureBody.
 */
export default class CreatureBodyController extends DeviceController {

    constructor(public creatureBody: CreatureBody, public objectManager: ObjectManager) {
        super(creatureBody);
        this.targetState = new CreatureBodyState(creatureBody, objectManager);
    }

    override point(position: DVector2, pointerIndex: number) {
        return this._doWithStateExtractions("point", () => {
            super.point(position, pointerIndex);
            const heldItem = this.creatureBody.selectedItem();
            if (heldItem !== undefined && heldItem.menu !== undefined) {
                heldItem.menu.point(new Vector2(position.x, position.y));
            }
        });
    }

    override triggerPointer(buttonIndex: number, pointerIndex: number) {
        return this._doWithStateExtractions("triggerPointer", () => {
            if (buttonIndex === 0) {
                this.creatureBody.doItemMainAction();
            } else {
                this.creatureBody.doItemSecondaryAction();
            }
        });
    }

    override pressKey(key: string, keyControllerIndex: number) {
        return this._doWithStateExtractions("pressKey", () => {
            if (key === " ") {
                console.log(this.creatureBody.transformNode.absolutePosition);
                this.creatureBody.jump();
            } else if (key === "q") {
                const selectedItem = this.creatureBody.selectedItem();
                if (selectedItem !== undefined) selectedItem.undo();
            } else if (key === "e") {
                const selectedItem = this.creatureBody.selectedItem();
                if (selectedItem !== undefined) selectedItem.redo();
            }
        });
    }
}