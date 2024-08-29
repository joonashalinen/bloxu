import ProxyMessenger from "../../../components/messaging/pub/ProxyMessenger";
import { DMessage } from "../../../components/messaging/pub/DMessage";
import MessageFactory from "../../../components/messaging/pub/MessageFactory";
import DVector2 from "../../../components/graphics3d/pub/DVector2";
import IInputEmitter from "../../../components/controls/pub/IInputEmitter";

/**
 * Class responsible for managing keyboard events and other input/output operations.
 */
export default class IOService {
    proxyMessenger: ProxyMessenger<DMessage, DMessage>;
    messageFactory: MessageFactory = new MessageFactory("ioService");

    constructor(
        public inputEmitters: IInputEmitter[]
    ) {
        this.proxyMessenger = new ProxyMessenger<DMessage, DMessage>();
    }

    /**
     * Initialize the IOService.
     */
    initialize(): void {
        this.inputEmitters.forEach((inputEmitter, inputEmitterIndex) => {
            inputEmitter.directionEmitters.forEach((emitter, directionEmitterIndex) => {
                emitter.onChangeDirection((direction: DVector2) => {
                    this._notifyAll("IOService:<event>changeDirection",
                        [direction, directionEmitterIndex, inputEmitterIndex]);
                });
            });
    
            inputEmitter.pointerEmitters.forEach((emitter, pointerEmitterIndex) => {
                emitter.onPoint((position: DVector2) => {
                    this._notifyAll("IOService:<event>point",
                        [position, pointerEmitterIndex, inputEmitterIndex]);
                });
                emitter.onTriggerPointer((button: number) => {
                    this._notifyAll("IOService:<event>triggerPointer",
                        [button, pointerEmitterIndex, inputEmitterIndex]);
                });
            });
    
            inputEmitter.keyEmitters.forEach((emitter, keyEmitterIndex) => {
                emitter.onPressKey((key: string) => {
                    this._notifyAll("IOService:<event>pressKey",
                        [key, keyEmitterIndex, inputEmitterIndex]);
                });
                emitter.onReleaseKey((key: string) => {
                    this._notifyAll("IOService:<event>releaseKey",
                        [key, keyEmitterIndex, inputEmitterIndex]);
                });
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
