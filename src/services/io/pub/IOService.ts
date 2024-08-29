import IDirectionEmitter from "../../../components/controls/pub/IDirectionEmitter";
import ProxyMessenger from "../../../components/messaging/pub/ProxyMessenger";
import { DMessage } from "../../../components/messaging/pub/DMessage";
import IPointerEmitter from "../../../components/controls/pub/IPointerEmitter";
import MessageFactory from "../../../components/messaging/pub/MessageFactory";
import DVector2 from "../../../components/graphics3d/pub/DVector2";
import IKeyEmitter from "../../../components/controls/pub/IKeyEmitter";

/**
 * Class responsible for managing keyboard events and other input/output operations.
 */
export default class IOService {
    proxyMessenger: ProxyMessenger<DMessage, DMessage>;
    messageFactory: MessageFactory = new MessageFactory("ioService");

    constructor(
        public directionControllers: IDirectionEmitter[],
        public pointerControllers: IPointerEmitter[],
        public keyControllers: IKeyEmitter[]
    ) {
        this.proxyMessenger = new ProxyMessenger<DMessage, DMessage>();
    }

    /**
     * Initialize the IOService.
     */
    initialize(): void {
        this.directionControllers.forEach((controller, index) => {
            controller.onDirectionChange((direction: DVector2) => {
                this._notifyAll("IOService:<event>directionChange", [direction, index]);
            });
        });

        this.pointerControllers.forEach((controller, index) => {
            controller.onPoint((position: DVector2) => {
                this._notifyAll("IOService:<event>point", [position, index]);
            });
            controller.onTrigger((position: DVector2, button: number) => {
                this._notifyAll("IOService:<event>pointerTrigger", [position, button, index]);
            });
        });

        this.keyControllers.forEach((controller, index) => {
            controller.onKeyDown((key: string) => {
                this._notifyAll("IOService:<event>keyDown", [key, index]);
            });
            controller.onKeyUp((key: string) => {
                this._notifyAll("IOService:<event>keyUp", [key, index]);
            });
        });
    }

    /**
     * Send and event to everyone in the service's environment.
     */
    private _notifyAll(event: string, args: unknown[]) {
        this.proxyMessenger.postMessage(
            this.messageFactory.createEvent("*", event, args)
        );
    }
}
