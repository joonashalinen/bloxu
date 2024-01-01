import IDirectionController from "../../../components/controls/pub/IDirectionController";
import ProxyMessenger from "../../../components/messaging/pub/ProxyMessenger";
import { DMessage } from "../../../components/messaging/pub/DMessage";
import TCompassPoint from "../../../components/geometry/pub/TCompassPoint";

/**
 * Class responsible for managing keyboard events and other input/output operations.
 */
export default class IOService {
    proxyMessenger: ProxyMessenger<DMessage, DMessage>;
    directionController: IDirectionController;

    constructor(directionController: IDirectionController) {
        this.directionController = directionController;
        this.proxyMessenger = new ProxyMessenger<DMessage, DMessage>();
    }

    /**
     * Initialize the IOService.
     */
    initialize(): void {
        this.directionController.onCompassPointChange(
            this._handleCompassPointChange.bind(this)
        );
    }

    /**
     * Handle the compassPointChange event from the direction controller.
     */
    private _handleCompassPointChange(compassPoint: TCompassPoint): void {
        // Trigger an event with the direction information
        this.proxyMessenger.postMessage({
            sender: "ioService",
            recipient: "*",
            type: "event",
            message: {
                type: "IOService:<event>controllerCompassPointChange",
                args: [compassPoint]
            }
        });
    }

    /**
     * Handle the directionChange event from the direction controller.
     */
    private _handleDirectionChange(direction: { x: number; y: number }): void {
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
