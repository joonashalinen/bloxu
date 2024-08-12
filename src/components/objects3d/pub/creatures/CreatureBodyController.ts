import DeviceController from "../DeviceController";
import CreatureBody from "./CreatureBody";

/**
 * An input controller for a CreatureBody that is meant to 
 * provide different modes of controlling the CreatureBody.
 */
export default class CreatureBodyController extends DeviceController {
    constructor(public creatureBody: CreatureBody) {
        super(creatureBody);
    }

    triggerPointer(buttonIndex: number): void {
        if (buttonIndex === 0) {
            this.creatureBody.doItemMainAction();
        } else {
            this.creatureBody.doItemSecondaryAction();
        }
    }

    pressFeatureKey(key: string): void {
        if (key === " ") {
            this.creatureBody.jump();
        }
    }
}