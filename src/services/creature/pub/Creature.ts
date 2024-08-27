import World3D from "../../world3d/pub/World3D";
import { DMessage } from "../../../components/messaging/pub/DMessage";
import ProxyMessenger from "../../../components/messaging/pub/ProxyMessenger";
import DVector3 from "../../../components/graphics3d/pub/DVector3";
import MessageFactory from "../../../components/messaging/pub/MessageFactory";
import SyncMessenger from "../../../components/messaging/pub/SyncMessenger";
import DVector2 from "../../../components/graphics3d/pub/DVector2";
import IService from "../../../components/services/pub/IService";
import CreatureBody from "../../../components/objects3d/pub/creatures/CreatureBody";

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
            "IOService:<event>directionChange": this.onControllerDirectionChange.bind(this),
            "IOService:<event>pointerTrigger": this.onControllerPointerTrigger.bind(this),
            "IOService:<event>point": this.onControllerPoint.bind(this),
            "IOService:<event>keyDown": this.onControllerKeyDown.bind(this),
            "IOService:<event>keyUp": this.onControllerKeyUp.bind(this)
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
    async onControllerPoint(position: DVector2, controllerIndex: number) {
        if (!this.spawned) {return}
        if (this.controlsDisabled) {return}

        const angle = (await this._modifyWorld(
            [this.bodyId(), position], 
            function(this: World3D, bodyId: string, position: DVector2) {
                const controller = this.getController(bodyId);
                const body = this.getObject(bodyId) as CreatureBody;
                controller.point(position);
                return body.horizontalAngle();
        }))[0] as number;
        
        this.proxyMessenger.postMessage(
            this.messageFactory.createEvent("*", "Creature:<event>rotate", [angle])
        );
    }

    /**
     * When a key has been pressed down on the controller.
     */
    async onControllerKeyDown(key: string, controllerIndex: number) {
        if (controllerIndex !== 0) {return}
        if (!this.spawned) {return}
        if (this.controlsDisabled) {return}

        await this.syncMessenger.postSyncMessage(
            this.messageFactory.createRequest("world3d", "control", [
                this.bodyId(), "pressFeatureKey", [key]])
        );

        this.proxyMessenger.postMessage(
            this.messageFactory.createEvent("*", "Creature:<event>pressFeatureKey")
        );
    }

    /**
     * When a pressed down key has been released on the controller.
     */
    async onControllerKeyUp(key: string, controllerIndex: number) {
        if (controllerIndex !== 0) {return}
        if (!this.spawned) {return}
        if (this.controlsDisabled) {return}

        this.proxyMessenger.postMessage(
            this.messageFactory.createRequest("world3d", "control", [
                this.bodyId(), "releaseFeatureKey", [key]])
        );
    }
    
    /**
     * When a pointer control has been pressed down (e.g. a mouse button).
     */
    async onControllerPointerTrigger(position: DVector2, buttonIndex: number, controllerIndex: number) {
        if (controllerIndex !== 0) {return}
        if (!this.spawned) {return}
        if (this.controlsDisabled) {return}
        
        const state = (await this._modifyWorld(
            [this.bodyId(), position, buttonIndex], 
            function(this: World3D, bodyId: string, position: DVector2, 
                buttonIndex: number) {
                
                const controller = this.getController(bodyId);
                controller.point(position);
                controller.triggerPointer(buttonIndex);
        }))[0];
    }

    /**
     * Does what Creature wants to do when the controller's main
     * direction control has changed (for example, the thumb joystick or WASD keys).
     */
    async onControllerDirectionChange(direction: DVector2, controllerIndex: number) {
        if (this.controlsDisabled) {return}
        if (controllerIndex !== 0) {return}
        
        if (this.initialized && this.spawned) {
            // Move the player's body in the controller's direction.
            (await this.syncMessenger.postSyncMessage({
                sender: this.id,
                recipient: "world3d",
                type: "request",
                message: {
                    type: "modify",
                    args: [{
                        boundArgs: [this.bodyId(), direction],
                        f: function(this: World3D, bodyId: string, direction: DVector2) {
                            const controller = this.getController(bodyId);
                            controller.move(direction);
                        }
                    }]
                }
            }))[0];
        }
        return this;
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
        this.onControllerDirectionChange({x: 0, y: 0}, 0);
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
}