import EventEmitter from "../../../components/events/pub/EventEmitter";
/**
 * Class responsible for managing keyboard events and other input/output operations.
 */
export default class IOService {
    constructor(directionController) {
        this.emitter = new EventEmitter();
        this.directionController = directionController;
        // Bind the methods to retain the correct 'this' context
        this.handleDirectionChange = this.handleDirectionChange.bind(this);
    }
    /**
     * Initialize the IOService.
     */
    initialize() {
        // Subscribe to the directionChange event of the direction controller
        this.directionController.onDirectionChange(this.handleDirectionChange);
    }
    /**
     * Handle the directionChange event from the direction controller.
     */
    handleDirectionChange(direction) {
        // Trigger an event with the direction information
        this.emitter.trigger("message", [{
                recipient: "*",
                message: {
                    type: "event",
                    message: {
                        type: "controllerDirectionChange",
                        args: [direction]
                    }
                }
            }]);
    }
}
//# sourceMappingURL=IOService.js.map