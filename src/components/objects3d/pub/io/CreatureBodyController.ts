import { Vector2 } from "@babylonjs/core";
import DVector2 from "../../../graphics3d/pub/DVector2";
import DeviceController from "./DeviceController";
import CreatureBody from "../creatures/CreatureBody";
import CreatureBodyState from "./CreatureBodyState";

/**
 * An input controller for a CreatureBody that is meant to 
 * provide different modes of controlling the CreatureBody.
 */
export default class CreatureBodyController extends DeviceController {

    constructor(public creatureBody: CreatureBody) {
        super(creatureBody);
        this.targetState = new CreatureBodyState(creatureBody);
    }

    triggerPointer(buttonIndex: number) {
        const properties = ["absolutePosition", "horizontalAngle",
            "activeStateName", "selectedItemName"];
        const stateBefore = this.targetState.extract(properties);

        if (buttonIndex === 0) {
            this.creatureBody.doItemMainAction();
        } else {
            this.creatureBody.doItemSecondaryAction();
        }

        const stateAfter = this.targetState.extract(properties);
        return {before: stateBefore, after: stateAfter};
    }

    pressFeatureKey(key: string) {
        const properties = ["absolutePosition", "horizontalAngle",
            "activeStateName", "selectedItemName"];
        const stateBefore = this.targetState.extract(properties);

        if (key === " ") {
            this.creatureBody.jump();
        } else if (key === "q") {
            const selectedItem = this.creatureBody.selectedItem();
            if (selectedItem !== undefined) selectedItem.undo();
        } else if (key === "e") {
            const selectedItem = this.creatureBody.selectedItem();
            if (selectedItem !== undefined) selectedItem.redo();
        }

        const stateAfter = this.targetState.extract(properties);
        return {before: stateBefore, after: stateAfter};
    }

    point(position: DVector2) {
        const stateUpdate = super.point(position);
        const heldItem = this.creatureBody.selectedItem();
        if (heldItem !== undefined && heldItem.menu !== undefined) {
            heldItem.menu.point(new Vector2(position.x, position.y));
        }
        return stateUpdate;
    }
}