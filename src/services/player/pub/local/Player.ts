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
import MouseRotatable from "../../../../components/objects3d/pub/MouseRotatable";
import BuildModeState from "../../../world3d/conf/custom_object_types/BuildModeState";
import { Vector3 } from "@babylonjs/core";
import BattleModeState from "../../../world3d/conf/custom_object_types/BattleModeState";
import ShootState from "../../../world3d/conf/custom_object_types/ShootState";

export type DirectionEvent = {direction: DVector2 | DVector3, body: DPlayerBody};

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
            "IOService:<event>directionChange": this.onControllerDirectionChange.bind(this),
            "IOService:<event>pointerTrigger": this.onControllerPointerTrigger.bind(this),
            "IOService:<event>point": this.onControllerPoint.bind(this),
            "IOService:<event>keyDown": this.onControllerKeyDown.bind(this),
            "IOService:<event>keyUp": this.onControllerKeyUp.bind(this),
            "World3D:Player:<event>projectileHit": this.onBodyProjectileHit.bind(this),
            "World3D:Player:<event>hitDeathAltitude": this.onBodyHitDeathAltitude.bind(this),
            "World3D:Player:<event>placeBlock": this.onBodyPlaceBlock.bind(this),
            "World3D:Player:<event>shoot": this.onBodyShoot.bind(this)
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
     * When the controller's pointer has changed position.
     */
    async onControllerPoint(position: DVector2, controllerIndex: number) {
        const angle = (await this.modifyWorld(
            [this.playerBodyId(), position], 
            function(this: World3D, bodyId: string, position: DVector2) {
                const body = this.getObject(bodyId) as PlayerBody;
                body.point(new this.babylonjs.Vector2(position.x, position.y));
                return body.bodyBuilder.topRotatable.angle;
        }))[0] as number;
        
        this.proxyMessenger.postMessage(
            this.messageFactory.createEvent("*", "Player:<event>rotate", [angle])
        );
    }

    /**
     * When a key has been pressed down on the controller.
     */
    async onControllerKeyDown(key: string, controllerIndex: number) {
        if (controllerIndex !== 0) {return}

        const inBattleState = (await this.modifyWorld(
            [this.playerBodyId(), key], 
            function(this: World3D, bodyId: string, key: string) {
                const body = this.getObject(bodyId) as PlayerBody;
                body.pressFeatureKey(key);
                return "battle" in body.actionModeStateMachine.activeStates;
        }))[0];

        if (key === " " && inBattleState) {
            this.proxyMessenger.postMessage(
                this.messageFactory.createEvent("*", "Player:<event>jump")
            );
        }
    }

    /**
     * When a pressed down key has been released on the controller.
     */
    async onControllerKeyUp(key: string, controllerIndex: number) {
        if (controllerIndex !== 0) {return}

        this.modifyWorld(
            [this.playerBodyId(), key], 
            function(this: World3D, bodyId: string, key: string) {
                const body = this.getObject(bodyId) as PlayerBody;
                body.releaseFeatureKey(key);
        });
    }
    
    /**
     * When a pointer control has been pressed down (e.g. a mouse button).
     */
    async onControllerPointerTrigger(position: DVector2, buttonIndex: number, controllerIndex: number) {
        if (buttonIndex !== 0) {return}
        if (controllerIndex !== 0) {return}
        const state = (await this.syncMessenger.postSyncMessage(
            this.messageFactory.createRequest("world3d", "modify", [
                {
                    boundArgs: [this.playerBodyId()],
                    f: function(
                        this: World3D,
                        bodyId: string
                    ) {
                        const body = this.getObject(bodyId) as PlayerBody;
                        body.doMainAction();
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
     * Does what Player wants to do when the controller's main
     * direction control has changed (for example, the thumb joystick or WASD keys).
     */
    async onControllerDirectionChange(direction: DVector2, controllerIndex: number) {
        if (this.disableControls) {return}
        if (controllerIndex !== 0) {return}
        if (this.initialized && this.spawned) {
            // Move the player's body in the controller's direction.
            const directionEvent = (await this.syncMessenger.postSyncMessage({
                sender: this.playerId,
                recipient: "world3d",
                type: "request",
                message: {
                    type: "modify",
                    args: [{
                        boundArgs: [this.playerBodyId(), direction],
                        f: function(this: World3D, bodyId: string, direction: DVector2) {
                            const body = this.getObject(bodyId) as PlayerBody;
                            const directionVector = new this.babylonjs.Vector2(direction.x, direction.y);
                            body.move(directionVector);
                            return {
                                direction: direction,
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
                        sendMsg: (eventName: string, event: unknown) => void,
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
                            // Get notifications of when the player character gets hit with a projectile.
                            playerBody.emitter.on("projectileHit", () => {
                                sendMsg("World3D:Player:<event>projectileHit", playerBody.state());
                            });
                            // Get notifications of when the player character reaches a death altitude (i.e. dies by falling).
                            playerBody.emitter.on("hitDeathAltitude", () => {
                                sendMsg("World3D:Player:<event>hitDeathAltitude", playerBody.state());
                            });
                            // Listen to block placement events.
                            const buildState = (playerBody.actionModeStateMachine.states["build"] as BuildModeState);
                            const placementGrid = buildState.placeMeshState.eventablePlacementGrid;
                            placementGrid.emitter.on("place", (cell: Vector3, absolutePosition: Vector3) => {
                                sendMsg(
                                    "World3D:Player:<event>placeBlock", 
                                    {
                                        cell: {x: cell.x, y: cell.y, z: cell.z},
                                        absolutePosition: {x: absolutePosition.x, y: absolutePosition.y, z: absolutePosition.z}
                                    }
                                );
                            });
                            // Listen to gun shot events.
                            const shootState = (playerBody.actionStateMachine.states["shoot"] as ShootState);
                            shootState.emitter.on("shoot", (direction: Vector3) => {
                                sendMsg(
                                    "World3D:Player:<event>shoot", 
                                    {
                                        direction: {x: direction.x, y: direction.y, z: direction.z},
                                        body: playerBody.state()
                                    } as DirectionEvent
                                );
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
    onBodyProjectileHit(state: DPlayerBody) {
        this.die();
    }

    /**
     * When the player's body has hit an altitude 
     * at which the player should die.
     */
    onBodyHitDeathAltitude() {
        this.die();
    }

    /**
     * When the player's body has placed a block.
     */
    onBodyPlaceBlock(event: {cell: DVector3, absolutePosition: DVector3}) {
        this.proxyMessenger.postMessage(
            this.messageFactory.createEvent("*", "Player:<event>placeBlock", [event.absolutePosition])
        );
    }

    /**
     * When the player's body has placed a block.
     */
    onBodyShoot(event: DirectionEvent) {
        this.proxyMessenger.postMessage(
            this.messageFactory.createEvent("*", "Player:<event>shoot", [event])
        );
    }

    /**
     * Causes the player to die if alive.
     */
    die() {
        if (this.isAlive) {
            this.isAlive = false;
            // Notify the service's environment that the player has died.
            this.proxyMessenger.postMessage(
                this.messageFactory.createEvent("*", "Player:<event>die", [this.playerId])
            );
        }
    }

    /**
     * Sets the player's rotation angle.
     */
    setAngle(angle: number) {
        this.modifyWorld(
            [angle, this.playerBodyId()], 
            function(this: World3D, angle: number, bodyId: string) {
                const body = this.getObject(bodyId) as PlayerBody;
                body.setAngle(angle);
            }
        )
    }

    /**
     * Place a block at the given absolute position in the world.
     */
    placeBlockAbsolute(absolutePosition: DVector3) {
        this.modifyWorld(
            [absolutePosition, this.playerBodyId()], 
            function(this: World3D, absolutePosition: DVector3, bodyId: string) {
                const body = this.getObject(bodyId) as PlayerBody;
                body.placeBlockAbsolute(
                    new this.babylonjs.Vector3(absolutePosition.x, absolutePosition.y, absolutePosition.z)
                );
            }
        )
    }

    /**
     * Call 'modify' on world3d.
     */
    async modifyWorld(boundArgs: unknown[], f: Function) {
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