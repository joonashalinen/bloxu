import EventEmitter from "../../../components/events/pub/EventEmitter";
import IDirectionController from "../../../components/controls/pub/IDirectionController";
import ProxyMessenger from "../../../components/messaging/pub/ProxyMessenger";
import { DMessage } from "../../../components/messaging/pub/DMessage";

/**
 * Class responsible for managing keyboard events and other input/output operations.
 */
export default class IOService {
    proxyMessenger: ProxyMessenger<DMessage, DMessage>;
    directionController: IDirectionController;

    constructor(directionController: IDirectionController) {
        this.directionController = directionController;
        this.handleDirectionChange = this.handleDirectionChange.bind(this);
        this.proxyMessenger = new ProxyMessenger<DMessage, DMessage>();
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
        this.proxyMessenger.postMessage({
            sender: "ioService",
            recipient: "*",
            type: "event",
            message: {
                type: "controllerDirectionChange",
                args: [direction]
            }
        });
    }
}
