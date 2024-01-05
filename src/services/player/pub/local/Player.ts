import IPlayer from "../IPlayer";
import World3D from "../../../world3d/pub/World3D";
import { DMessage } from "../../../../components/messaging/pub/DMessage";
import ProxyMessenger from "../../../../components/messaging/pub/ProxyMessenger";
import DVector3 from "../../../../components/graphics3d/pub/DVector3";
import MessageFactory from "../../../../components/messaging/pub/MessageFactory";
import PlayerBody from "../../../world3d/conf/custom_object_types/PlayerBody";
import SyncMessenger from "../../../../components/messaging/pub/SyncMessenger";
import DPlayerBody from "../../../world3d/conf/custom_object_types/DPlayerBody";
import DVector2 from "../../../../components/graphics3d/pub/DVector2";
import TCompassPoint from "../../../../components/geometry/pub/TCompassPoint";
import MouseRotatable from "../../../../components/objects3d/pub/MouseRotatable";

export type DirectionEvent = {direction: DVector2, body: DPlayerBody};
export type CompassPointEvent = {compassPoint: TCompassPoint, body: DPlayerBody};

/**
 * Class that contains the operations and state 
 * of the LocalPlayer service.
 */
export default class Player implements IPlayer {
    eventHandlers: {[name: string]: Function}
    initialized: boolean;
    proxyMessenger: ProxyMessenger<DMessage, DMessage>;
    syncMessenger: SyncMessenger;
    messageFactory: MessageFactory;
    spawned: boolean;
    disableControls: boolean;
    isAlive: boolean;

    constructor(public playerId: string) {
        this.eventHandlers = {
            "IOService:<event>controllerCompassPointChange": this.onControllerCompassPointChange.bind(this),
            "World3D:<event>mouseDown": this.onMouseDown.bind(this),
            "World3D:Player:<event>rotate": this.onBodyRotate.bind(this),
            "World3D:Player:<event>projectileHit": this.onBodyProjectileHit.bind(this)
        };
        this.initialized = false;
        this.spawned = false;
        this.isAlive = true;
        this.proxyMessenger = new ProxyMessenger<DMessage, DMessage>();
        this.syncMessenger = new SyncMessenger(this.proxyMessenger);
        this.messageFactory = new MessageFactory(playerId);
        this.disableControls = false;
    }

    /**
     * Id of the player body object in the world.
     */
    playerBodyId() {
        return "Player:PlayerBody?" + this.playerId;
    }

    /**
     * When a mouse button has been pressed down on the game world's screen.
     */
    async onMouseDown(event: {x: number, y: number}) {
        // Shoot gun.
        const state = (await this.syncMessenger.postSyncMessage(
            this.messageFactory.createRequest("world3d", "modify", [
                {
                    boundArgs: [this.playerBodyId()],
                    f: function(
                        this: World3D,
                        bodyId: string
                    ) {
                        const body = this.getObject(bodyId) as PlayerBody;
                        // Make the body do its main action.
                        // Depending on the current state of the body 
                        // this may be either shooting or placing a block.
                        const direction = (body.body.as("MouseRotatable") as MouseRotatable).direction;
                        body.doMainAction();
                        return {
                            direction: {x: direction.x, y: direction.y},
                            body: body.state()
                        };
                    }
                }
            ])
        ))[0] as DirectionEvent;

        // Send a message to the environment that the player has shot.
        this.proxyMessenger.postMessage(
            this.messageFactory.createEvent("*", "Player:<event>shoot", [state])
        );
    }

    /**
     * Does what Player wants to do when the controller's 
     * direction control has changed (for example, the thumb joystick or WASD keys).
     */
    async onControllerCompassPointChange(compassPoint: TCompassPoint) {
        if (this.disableControls) {return}
        if (this.initialized && this.spawned) {
            // Move the player's body in the controller's direction.
            const directionEvent = (await this.syncMessenger.postSyncMessage({
                sender: this.playerId,
                recipient: "world3d",
                type: "request",
                message: {
                    type: "modify",
                    args: [{
                        boundArgs: [this.playerBodyId(), compassPoint],
                        f: function(this: World3D, bodyId: string, compassPoint: TCompassPoint) {
                            const body = this.getObject(bodyId) as PlayerBody;
                            body.move(compassPoint);
                            return {
                                compassPoint: compassPoint,
                                body: body.state()
                            };
                        }
                    }]
                }
            }))[0] as DirectionEvent;
            // Send a message to the environment that the player has changed movement direction.
            this.proxyMessenger.postMessage(
                this.messageFactory.createEvent("*", "Player:<event>move", [directionEvent])
            );
        }
        return this;
    }

    /**
     * Initialization procedure for the LocalPlayer service.
     */
    initialize() {
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
                this.playerBodyId(),
                "PlayerBody",
                {
                    boundArgs: [this.playerBodyId(), startingPosition],
                    f: function(
                        this: World3D,
                        playerBodyId: string,
                        startingPosition: DVector3
                    ) {
                        // Determine the arguments passed to PlayerBody's constructor.
                        return [
                            playerBodyId,
                            startingPosition,
                            this.scene,
                            this.meshConstructors
                        ];
                    }
                }
            ])
        );

        if (this.disableControls) {
            // Disable UI of body.
            this.proxyMessenger.postMessage(
                this.messageFactory.createRequest("world3d", "modifyObject", [
                    this.playerBodyId(),
                    {
                        boundArgs: [],
                        f: function(
                            this: World3D,
                            body: PlayerBody
                        ) {
                            body.disableUI();
                            return body;
                        }
                    }
                ])
            );
        }

        // Set event listeners.
        this.proxyMessenger.postMessage(
            this.messageFactory.createRequest("world3d", "listen", [
                this.playerId,
                {
                    boundArgs: [this.playerBodyId(), this.disableControls],
                    f: function(
                        this: World3D, 
                        sendMsg: (eventName: string, event: DPlayerBody) => void,
                        playerBodyId: string,
                        disableControls: boolean
                    ) {
                        const playerBody = this.getObject(playerBodyId) as PlayerBody;

                        // If the player service should be disconnected 
                        // from any controls (such as the keyboard or mouse) 
                        // then we do not want to set the related event listeners.
                        if (!disableControls) {
                            // Let the player's body handle updating its own 
                            // objects.
                            playerBody.enableAutoUpdate();
                            // Get notifications of the player character's rotation events from World3D.
                            (playerBody.body.as("MouseRotatable") as MouseRotatable).emitter.on("rotate", () => {
                                sendMsg("World3D:Player:<event>rotate", playerBody.state())
                            });
                            // Get notifications of when the player character gets hit with a projectile.
                            playerBody.emitter.on("projectileHit", () => {
                                sendMsg("World3D:Player:<event>projectileHit", playerBody.state());
                            });
                        }
                    }
                }
            ])
        );

        this.spawned = true;

        return true;
    }

    /**
     * Sets the state of the Player character's body.
     */
    setState(state: DPlayerBody) {
        this.proxyMessenger.postMessage(
            this.messageFactory.createRequest("world3d", "modify", [
                {
                    boundArgs: [this.playerBodyId(), state],
                    f: function(
                        this: World3D,
                        bodyId: string,
                        state: DPlayerBody
                    ) {
                        const body = this.getObject(bodyId) as PlayerBody;
                        body.setState(state);
                    }
                }
            ])
        );
    }

    /**
     * When the Player's player body has rotated in the world.
     * This is an event that occurs only if the Player's controls are not 
     * disabled.
     */
    onBodyRotate(state: DPlayerBody) {
        // Send a rotate event to the service's environment.
        this.proxyMessenger.postMessage(
            this.messageFactory.createEvent("*", "Player:<event>rotate", [state])
        )
    }

    /**
     * When the Player's player body has rotated in the world.
     * This is an event that occurs only if the Player's controls are not 
     * disabled.
     */
    onBodyProjectileHit(state: DPlayerBody) {
        if (this.isAlive) {
            this.isAlive = false;
            // Notify the service's environment that the player has died.
            this.proxyMessenger.postMessage(
                this.messageFactory.createEvent("*", "Player:<event>die", [this.playerId])
            );
        }
    }
}