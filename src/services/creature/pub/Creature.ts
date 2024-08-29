import World3D from "../../world3d/pub/World3D";
import { DMessage } from "../../../components/messaging/pub/DMessage";
import ProxyMessenger from "../../../components/messaging/pub/ProxyMessenger";
import DVector3 from "../../../components/graphics3d/pub/DVector3";
import MessageFactory from "../../../components/messaging/pub/MessageFactory";
import SyncMessenger from "../../../components/messaging/pub/SyncMessenger";
import DVector2 from "../../../components/graphics3d/pub/DVector2";
import IService from "../../../components/services/pub/IService";
import CreatureBody from "../../../components/objects3d/pub/creatures/CreatureBody";
import DCreatureBodyState from "../../../components/objects3d/pub/io/DCreatureBodyState";
import { DStateUpdate } from "../../../components/controls/pub/IController";

/**
 * Class that contains the operations and state 
 * of the Creature service.
 */
export default class Creature implements IService {
    eventHandlers: {[name: string]: Function}
    initialized: boolean;
    proxyMessenger: ProxyMessenger<DMessage, DMessage>;
    syncMessenger: SyncMessenger;
    messageFactory: MessageFactory;
    spawned: boolean;
    controlsDisabled: boolean;
    disableEvents: boolean;
    isAlive: boolean;

    constructor(public id: string, public bodyType: string) {
        this.eventHandlers = {
            "IOService:<event>changeDirection": this.onChangeDirectionInput.bind(this),
            "IOService:<event>triggerPointer": this.onTriggerPointerInput.bind(this),
            "IOService:<event>point": this.onPointInput.bind(this),
            "IOService:<event>pressKey": this.onPressKeyInput.bind(this),
            "IOService:<event>releaseKey": this.onReleaseKeyInput.bind(this)
        };
        this.initialized = false;
        this.spawned = false;
        this.isAlive = true;
        this.proxyMessenger = new ProxyMessenger<DMessage, DMessage>();
        this.syncMessenger = new SyncMessenger(this.proxyMessenger);
        this.messageFactory = new MessageFactory(id);
        this.controlsDisabled = true;
        this.disableEvents = false;
    }

    /**
     * Id of the creature's body object in the world.
     */
    bodyId() {
        return `Creature:CreatureBody?${this.id}`;
    }

    /**
     * When the controller's pointer has changed position.
     */
    async onPointInput(position: DVector2, pointerIndex: number, controllerIndex: number) {
        if (!this.spawned) {return}
        if (this.controlsDisabled) {return}
        const stateUpdate = await this._redirectInput("point", [position, pointerIndex]);
        this._postEvent("*", "Creature:<event>controllerPoint",
            [position, pointerIndex, stateUpdate]);
    }

    /**
     * When a pointer control has been pressed down (e.g. a mouse button).
     */
    async onTriggerPointerInput(buttonIndex: number, pointerIndex: number, controllerIndex: number) {
        if (!this.spawned) {return}
        if (this.controlsDisabled) {return}
        const stateUpdate = await this._redirectInput("triggerPointer",
            [buttonIndex, pointerIndex]);
        this._postEvent("*", "Creature:<event>controllerTriggerPointer",
            [buttonIndex, pointerIndex, stateUpdate]);
    }

    /**
     * When a key has been pressed down on the controller.
     */
    async onPressKeyInput(key: string, keyControllerIndex: number, controllerIndex: number) {
        if (!this.spawned) {return}
        if (this.controlsDisabled) {return}
        const stateUpdate = await this._redirectInput("pressKey", [key, keyControllerIndex]);
        this._postEvent("*", "Creature:<event>controllerPressKey", [key, keyControllerIndex, stateUpdate]);
    }

    /**
     * When a pressed down key has been released on the controller.
     */
    async onReleaseKeyInput(key: string, keyControllerIndex: number, controllerIndex: number) {
        if (!this.spawned) {return}
        if (this.controlsDisabled) {return}
        const stateUpdate = await this._redirectInput("releaseKey", [key, keyControllerIndex]);
        this._postEvent("*", "Creature:<event>controllerReleaseKey", [key, keyControllerIndex, stateUpdate]);
    }

    /**
     * Does what Creature wants to do when the controller's main
     * direction control has changed (for example, the thumb joystick or WASD keys).
     */
    async onChangeDirectionInput(direction: DVector2, directionControllerIndex: number, controllerIndex: number) {
        if (!this.spawned) {return}
        if (this.controlsDisabled) {return}
        const stateUpdate = await this._redirectInput("changeDirection", [direction, directionControllerIndex]);
        this._postEvent("*", "Creature:<event>controllerChangeDirection", [direction, directionControllerIndex, stateUpdate]);
    }

    /**
     * Initialization procedure for the LocalCreature service.
     */
    async initialize() {
        this.initialized = true;
        return true;
    }

    /**
     * Spawn the player's body at the given position.
     */
    spawn(startingPosition: DVector3): boolean {
        // Create the player's body.
        this.proxyMessenger.postMessage(
            this.messageFactory.createRequest("world3d", "createObject", [
                this.bodyId(), this.bodyType, [startingPosition]
            ])
        );

        this.proxyMessenger.postMessage(
            this.messageFactory.createRequest("world3d", "createController", [
                "CreatureBodyController", this.bodyId()])
        );

        if (!this.controlsDisabled) {
            this._makeBodyCameraTarget();
        }

        this.spawned = true;
        return true;
    }

    /**
     * Disables controls for the player.
     */
    disableControls() {
        if (this.controlsDisabled) return;
        this.onChangeDirectionInput({x: 0, y: 0}, 0, 0);
        this.controlsDisabled = true;
    }

    /**
     * Enables controls for the player.
     */
    async enableControls() {
        if (!this.controlsDisabled) return;
        this.controlsDisabled = false;
        if (this.spawned) {
            await this._makeBodyCameraTarget();
        }
    }

    /**
     * Makes the player's body the centered target of the camera.
     */
    private async _makeBodyCameraTarget() {
        await this._modifyWorld([this.bodyId()],
            function(this: World3D, bodyId: string) {
                const body = this.getObject(bodyId) as CreatureBody;
                this.camera.lockedTarget = body.transformNode;
                this.camera.radius = 16;
            }
        );
    }

    /**
     * Call 'modify' on world3d.
     */
    private async _modifyWorld(boundArgs: unknown[], f: Function) {
        return this.syncMessenger.postSyncMessage(
            this.messageFactory.createRequest("world3d", "modify", [
                {
                    boundArgs: boundArgs,
                    f: f
                }
            ])
        );
    }

    /**
     * Call the IController of the Creature in World3D.
     */
    private async _redirectInput(method: string, args: unknown[]) {
        return (await this.syncMessenger.postSyncMessage(
            this.messageFactory.createRequest("world3d", "control", [
                this.bodyId(), method, args])
        ))[0] as DStateUpdate<DCreatureBodyState>;
    }

    /**
     * Send an event message to everyone.
     */
    private _postEvent(to: string, name: string, args: unknown[]) {
        this.proxyMessenger.postMessage(
            this.messageFactory.createEvent(to, name, args)
        );
    }
}