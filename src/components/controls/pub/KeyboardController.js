import { Vector2 } from "@babylonjs/core";
import EventEmitter from "../../../components/events/pub/EventEmitter";
/**
 * Class responsible for managing keyboard events and implementing IDirectionController.
 */
export default class KeyboardController {
    constructor(document) {
        this.emitter = new EventEmitter();
        this.document = document;
        this.pressedKeys = new Set();
        this.document.addEventListener("keydown", this.handleKeyDown.bind(this));
        this.document.addEventListener("keyup", this.handleKeyUp.bind(this));
    }
    /**
     * Handle the keydown event.
     */
    handleKeyDown(event) {
        // Add the pressed key to the set
        this.pressedKeys.add(event.key);
        // Calculate the direction based on the pressed keys
        const direction = this.calculateDirection();
        // Trigger an event with the direction information
        this.emitter.trigger("directionChange", [{ direction }]);
    }
    /**
     * Handle the keyup event.
     */
    handleKeyUp(event) {
        // Remove the released key from the set
        this.pressedKeys.delete(event.key);
        // Calculate the direction based on the remaining pressed keys
        const direction = this.calculateDirection();
        // Trigger an event with the direction information
        this.emitter.trigger("directionChange", [{ direction }]);
    }
    /**
     * Calculate the direction based on the currently pressed keys.
     */
    calculateDirection() {
        let x = 0;
        let y = 0;
        // Check the pressed keys and update the direction accordingly
        if (this.pressedKeys.has("w")) {
            y -= 1;
        }
        if (this.pressedKeys.has("s")) {
            y += 1;
        }
        if (this.pressedKeys.has("a")) {
            x -= 1;
        }
        if (this.pressedKeys.has("d")) {
            x += 1;
        }
        // Normalize the direction to ensure consistent movement speed
        const length = Math.sqrt(x * x + y * y);
        if (length !== 0) {
            x /= length;
            y /= length;
        }
        return new Vector2(x, y);
    }
    // Implement the onDirectionChange method from the IDirectionController interface
    onDirectionChange(callback) {
        this.emitter.on("directionChange", callback);
        return this;
    }
    // Implement the offDirectionChange method from the IDirectionController interface
    offDirectionChange(callback) {
        this.emitter.off("directionChange", callback);
        return this;
    }
}
//# sourceMappingURL=KeyboardController.js.map