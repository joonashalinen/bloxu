import World3D from "../../world3d/pub/World3D";
import { DMessage } from "../../../components/messaging/pub/DMessage";
import ProxyMessenger from "../../../components/messaging/pub/ProxyMessenger";
import DVector3 from "../../../components/graphics3d/pub/DVector3";
import DVector2 from "../../../components/graphics3d/pub/DVector2";
import IService from "../../../components/services/pub/IService";
import CreatureBody from "../../../components/objects3d/pub/creatures/CreatureBody";
import Channel from "../../../components/messaging/pub/Channel";

type TOtherServiceIdMap = {
    "world3d": string
};

/**
 * Class that contains the operations and state 
 * of the Creature service.
 */
export default class Creature implements IService {
    eventHandlers: {[name: string]: Function};
    initialized: boolean;
    proxyMessenger: ProxyMessenger<DMessage, DMessage>;
    world3dChannel: Channel;
    allChannel: Channel;
    spawned: boolean;
    controlsDisabled: boolean;
    disableEvents: boolean;
    isAlive: boolean;
    paused: boolean = false;

    constructor(public id: string, public bodyType: string,
        public otherServiceIdMap: TOtherServiceIdMap = {world3d: "world3d"}) {

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
        this.world3dChannel = new Channel(this.id, this.otherServiceIdMap.world3d,
            this.proxyMessenger);
        this.allChannel = new Channel(this.id, "*", this.proxyMessenger);
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
        if (this.paused) {return}
        const stateUpdate = await this.world3dChannel.request("control",
            [this.bodyId(), "point", [position, pointerIndex]]);
        this.allChannel.sendEvent("Creature:<event>controllerPoint",
            [position, pointerIndex, controllerIndex, stateUpdate]);
    }

    /**
     * When a pointer control has been pressed down (e.g. a mouse button).
     */
    async onTriggerPointerInput(buttonIndex: number, pointerIndex: number,
        controllerIndex: number) {
        if (!this.spawned) {return}
        if (this.controlsDisabled) {return}
        if (this.paused) {return}
        const stateUpdate = await this.world3dChannel.request("control",
            [this.bodyId(), "triggerPointer", [buttonIndex, pointerIndex]]);
        this.allChannel.sendEvent("Creature:<event>controllerTriggerPointer",
            [buttonIndex, pointerIndex, controllerIndex, stateUpdate]);
    }

    /**
     * When a key has been pressed down on the controller.
     */
    async onPressKeyInput(key: string, keyControllerIndex: number, controllerIndex: number) {
        if (!this.spawned) {return}
        if (this.controlsDisabled) {return}
        if (this.paused) {return}
        const stateUpdate = await this.world3dChannel.request("control",
            [this.bodyId(), "pressKey", [key, keyControllerIndex]]);
        this.allChannel.sendEvent("Creature:<event>controllerPressKey",
            [key, keyControllerIndex, controllerIndex, stateUpdate]);
    }

    /**
     * When a pressed down key has been released on the controller.
     */
    async onReleaseKeyInput(key: string, keyControllerIndex: number, controllerIndex: number) {
        if (!this.spawned) {return}
        if (this.controlsDisabled) {return}
        if (this.paused) {return}
        const stateUpdate = await this.world3dChannel.request("control",
            [this.bodyId(), "releaseKey", [key, keyControllerIndex]]);
        this.allChannel.sendEvent("Creature:<event>controllerReleaseKey",
            [key, keyControllerIndex, controllerIndex, stateUpdate]);
    }

    /**
     * Does what Creature wants to do when the controller's main
     * direction control has changed (for example, the thumb joystick or WASD keys).
     */
    async onChangeDirectionInput(direction: DVector2, directionControllerIndex: number,
        controllerIndex: number) {
        if (!this.spawned) {return}
        if (this.controlsDisabled) {return}
        if (this.paused) {return}
        const stateUpdate = await this.world3dChannel.request("control",
            [this.bodyId(), "changeDirection", [direction, directionControllerIndex]]);
        this.allChannel.sendEvent("Creature:<event>controllerChangeDirection",
            [direction, directionControllerIndex, controllerIndex, stateUpdate]);
    }

    /**
     * Initialization procedure for the LocalCreature service.
     */
    async initialize() {
        this.initialized = true;
        return true;
    }

    /**
     * Spawn the creature's body at the given position.
     */
    spawn(startingPosition: DVector3): boolean {
        // Create the creature's body and the controller for the body.
        this.world3dChannel.request("createObject",
            [this.bodyId(), this.bodyType, [startingPosition, true]]);
        this.world3dChannel.request("createController", ["CreatureBodyController", this.bodyId()]);

        if (!this.controlsDisabled) {
            this.makeBodyCameraTarget();
        }

        this.spawned = true;
        return true;
    }

    /**
     * Spawns the creature again, after having been
     * spawned previously. We assume that the creature's
     * objects have been disposed of in World3D.
     */
    respawn(startingPosition: DVector3) {
        this.spawned = false;
        return this.spawn(startingPosition);
    }

    /**
     * Disables controls for the player.
     */
    disableControls() {
        if (this.controlsDisabled) return true;
        this.onChangeDirectionInput({x: 0, y: 0}, 0, 0);
        this.controlsDisabled = true;
        return true;
    }

    /**
     * Pauses the Creature service, making it temporarily
     * halt its regular behavior.
     */
    pause() {
        this.paused = true;
        return true;
    }

    /**
     * Undoes the effect of .pause()
     */
    resume() {
        this.paused = false;
        return true;
    }

    /**
     * Enables controls for the creature.
     */
    async enableControls() {
        if (!this.controlsDisabled) return;
        this.controlsDisabled = false;
        if (this.spawned) {
            await this.makeBodyCameraTarget();
        }
    }

    /**
     * Makes the creature's body the centered target of the camera.
     */
    async makeBodyCameraTarget() {
        const targetBody = function(this: World3D, bodyId: string) {
            const body = this.getObject(bodyId) as CreatureBody;
            this.camera.lockedTarget = body.transformNode;
            this.camera.radius = 16;
            return true;
        };

        this.world3dChannel.request("modify", [{boundArgs: [this.bodyId()], f: targetBody}]);
    }
}