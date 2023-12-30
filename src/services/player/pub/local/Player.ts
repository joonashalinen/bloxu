import IPlayer from "../IPlayer";
import World3D from "../../../world3d/pub/World3D";
import { DMessage } from "../../../../components/messaging/pub/DMessage";
import ProxyMessenger from "../../../../components/messaging/pub/ProxyMessenger";
import DVector3 from "../../../../components/graphics3d/pub/DVector3";
import MessageFactory from "../../../../components/messaging/pub/MessageFactory";
import DataObject from "../../../../components/data_structures/pub/DataObject";
import MeshLeash2D from "../../../../components/graphics3d/pub/MeshLeash2D";
import DMeshLeash2D from "../../../../components/graphics3d/pub/DMeshLeash2D";
import PlayerBody from "../../../world3d/conf/custom_object_types/PlayerBody";

/**
 * Class that contains the operations and state 
 * of the LocalPlayer service.
 */
export default class Player implements IPlayer {
    eventHandlers: {[name: string]: Function}
    initialized: boolean;
    proxyMessenger: ProxyMessenger<DMessage, DMessage>;
    messageFactory: MessageFactory;
    spawned: boolean;
    disableControls: boolean;

    constructor(public playerId: string) {
        this.eventHandlers = {
            "controllerDirectionChange": this.onControllerDirectionChange.bind(this)
        };
        this.initialized = false;
        this.spawned = false;
        this.proxyMessenger = new ProxyMessenger<DMessage, DMessage>();
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
     * Does what Player wants to do when the controller's 
     * direction control has changed (for example, the thumb joystick of WASD keys).
     */
    onControllerDirectionChange(event): Player {
        if (this.disableControls) {return}

        const direction = event.direction;
        // Reverse the controls for player 2, who is 
        // on the opposite side of the map.
        // A more general solution should be developed for this, 
        // but due to lack of time, this will have to suffice.
        if (this.playerId === "player-2") {
            direction.x = direction.x * (-1);
            direction.y = direction.y * (-1);
        }

        if (this.initialized && this.spawned) {
            // Move the player's body in the controller's direction.
            this.proxyMessenger.postMessage({
                sender: this.playerId,
                recipient: "world3d",
                type: "request",
                message: {
                    type: "modifyObject",
                    args: [this.playerBodyId(), {
                        boundArgs: [event.direction],
                        f: function(this: World3D, direction: {x: number, y:number}, body: PlayerBody) {
                            body.movable.move(new this.babylonjs.Vector3(direction.x, 0, direction.y * (-1)));
                            return body;
                        }
                    }]
                }
            });
            return this;
        } else {
            return this;
        }
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

        if (!this.disableControls) {

            // Set event listeners.
            this.proxyMessenger.postMessage(
                this.messageFactory.createRequest("world3d", "listen", [
                    this.playerId,
                    {
                        boundArgs: [this.playerBodyId()],
                        f: function(
                            this: World3D, 
                            sendMsg: (eventName: string, event: DataObject) => void,
                            playerBodyId: string
                        ) {
                            const playerBody = this.getObject(playerBodyId) as PlayerBody;

                            // Create 'leash' that tracks the 2D screen
                            // vector between the mouse and the player's character.
                            const leashId = `Player:MeshLeash2D?${playerBodyId}`;
                            this.createObject(leashId, "MeshLeash2D", [playerBody.mainMesh]);
                            const leash = this.getObject(leashId) as MeshLeash2D;

                            leash.onChange((leash: DMeshLeash2D) => {
                                const angle = Math.atan2(leash.leash.y, leash.leash.x);
                                playerBody.arrowPointer.setRotation({x: 0, y: angle + Math.PI, z: 0});
                            });
                        }
                    }
                ])
            );
        }

        this.spawned = true;

        return true;
    }
}