import EventEmitter from "../../../components/events/pub/EventEmitter";
import IDirectionController from "../../../components/controls/pub/IDirectionController";

/**
 * Class responsible for managing keyboard events and other input/output operations.
 */
export default class IOService {
    emitter: EventEmitter;
    directionController: IDirectionController;

    constructor(directionController: IDirectionController) {
        this.emitter = new EventEmitter();
        this.directionController = directionController;

        // Bind the methods to retain the correct 'this' context
        this.handleDirectionChange = this.handleDirectionChange.bind(this);
    }

    /**
     * Initialize the IOService.
     */
    initialize(): void {
        // Subscribe to the directionChange event of the direction controller
        this.directionController.onDirectionChange(this.handleDirectionChange);
    }

    /**
     * Handle the directionChange event from the direction controller.
     */
    handleDirectionChange(direction: { x: number; y: number }): void {
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
