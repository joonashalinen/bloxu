import DVector3 from "../../../components/graphics3d/pub/DVector3";
import Creature from "./Creature";
import IService from "../../../components/services/pub/IService";
import { DMessage } from "../../../components/messaging/pub/DMessage";
import MessageFactory from "../../../components/messaging/pub/MessageFactory";
import ProxyMessenger from "../../../components/messaging/pub/ProxyMessenger";
import SyncMessenger from "../../../components/messaging/pub/SyncMessenger";
import DVector2 from "../../../components/graphics3d/pub/DVector2";
import { DStateUpdate } from "../../../components/controls/pub/IController";
import DCreatureBodyState from "../../../components/objects3d/pub/io/DCreatureBodyState";

/**
 * A Creature that is controlled remotely by another online creature.
 */
export default class RemoteCreature implements IService {
    creature: Creature;
    eventHandlers: {[name: string]: Function};
    proxyMessenger: ProxyMessenger<DMessage, DMessage>;

    constructor(public id: string, bodyId: string) {
        this.creature = new Creature(id, bodyId);
        this.creature.controlsDisabled = true;
        this.creature.disableEvents = true;
        this.proxyMessenger = this.creature.proxyMessenger;

        this.eventHandlers = {
            "OnlineSynchronizer:Creature:<event>controllerPoint": this.onHostControllerPoint.bind(this),
            "OnlineSynchronizer:Creature:<event>controllerTriggerPointer": this.onHostTriggerPointer.bind(this),
            "OnlineSynchronizer:Creature:<event>controllerPressKey": this.onHostPressKey.bind(this),
            "OnlineSynchronizer:Creature:<event>controllerReleaseKey": this.onHostReleaseKey.bind(this),
            "OnlineSynchronizer:Creature:<event>controllerChangeDirection": this.onHostChangeDirection.bind(this),
        };
    }
    
    /**
     * Initialize RemoteCreature service.
     */
    async initialize() {
        return this.creature.initialize();
    }

    spawn(startingPosition: DVector3) {
        // Create the player's body and the controller for the body.
        this.creature.world3dChannel.request("createObject",
            [this.creature.bodyId(), this.creature.bodyType, [startingPosition]]);
        this.creature.world3dChannel.request("createRemoteController",
            ["RemoteCreatureBodyController", this.creature.bodyId()]);

        if (!this.creature.controlsDisabled) {
            this.creature.makeBodyCameraTarget();
        }

        this.creature.spawned = true;
        return true;
    }

    /**
     * When the host Creature has called 'point' for its body's controller.
     */
    async onHostControllerPoint(position: DVector2, pointerIndex: number,
        controllerIndex: number, stateUpdate: DStateUpdate<DCreatureBodyState>) {
        this._callController("point", [position, pointerIndex, stateUpdate]);
    }

    /**
     * Handler for when the host Creature has called 'triggerPointer' for its body's controller.
     */
    async onHostTriggerPointer(buttonIndex: number, pointerIndex: number,
        controllerIndex: number, stateUpdate: DStateUpdate<DCreatureBodyState>) {
        this._callController("triggerPointer", [buttonIndex, pointerIndex, stateUpdate]);
    }

    /**
     * Handler for when the host Creature has called 'pressKey' for its body's controller.
     */
    async onHostPressKey(key: string, keyControllerIndex: number, controllerIndex: number,
        stateUpdate: DStateUpdate<DCreatureBodyState>) {
        this._callController("pressKey", [key, keyControllerIndex, stateUpdate]);
    }

    /**
     * Handler for when the host Creature has called 'releaseKey' for its body's controller.
     */
    async onHostReleaseKey(key: string, keyControllerIndex: number, controllerIndex: number,
        stateUpdate: DStateUpdate<DCreatureBodyState>) {
        this._callController("releaseKey", [key, keyControllerIndex, stateUpdate]);
    }

    /**
     * Handler for when the host Creature has called 'changeDirection' for its body's controller.
     */
    async onHostChangeDirection(direction: DVector2, directionControllerIndex: number,
        controllerIndex: number, stateUpdate: DStateUpdate<DCreatureBodyState>) {
        this._callController("changeDirection", [direction, directionControllerIndex, stateUpdate]);
    }

    /**
     * Calls the RemoteController of the RemoteCreature.
     */
    private async _callController(methodName: string, args: unknown[]) {
        if (!this.creature.spawned) {return}
        const controlResult = await this.creature.world3dChannel.request("remoteControl",
            [this.creature.bodyId(), methodName, args]);
    }
}