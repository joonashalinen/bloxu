import { DMessage } from "../../../components/messaging/pub/DMessage";
import ProxyMessenger from "../../../components/messaging/pub/ProxyMessenger";
import SyncMessenger from "../../../components/messaging/pub/SyncMessenger";
import MessageFactory from "../../../components/messaging/pub/MessageFactory";
import World3D from "../../world3d/pub/World3D";
import PlayerBody from "../../world3d/conf/custom_object_types/PlayerBody";

interface Vector3D {
    x: number;
    y: number;
    z: number;
}

/**
 * Class that contains the operations and state 
 * of the LocalGameMaster service.
 */
export default class GameMaster {
    proxyMessenger = new ProxyMessenger<DMessage, DMessage>();
    syncMessenger: SyncMessenger;
    eventHandlers: {[name: string]: Function}
    initialized: boolean;
    messageFactory = new MessageFactory("gameMaster");
    localPlayerId: string;
    gameRunning: boolean = false;
    cubeSize: number = 1.34;
    characterHeight: number = 1.8;
    
    constructor() {
        this.syncMessenger = new SyncMessenger(this.proxyMessenger);
        this.eventHandlers = {
            "Player:<event>die": this.onPlayerDeath.bind(this),
            "OnlineSynchronizer:<event>remotePlayerJoined": this.onPlayerJoined.bind(this)
        };
        this.initialized = false;
    }

    /**
     * Spawn everything needed for the game 
     * and make the 3D world run.
     */
    private async _startGame() {

        // vvv Setup environment. vvv

        // Make world run.
        this.proxyMessenger.postMessage(
            this.messageFactory.createRequest("world3d", "run")
        );

        // Create the cube islands the players will spawn on.
        this.createCubeIsland("GameMaster:FloatingCube?1", {x: 0, y: 0, z: 0});
        this.createCubeIsland("GameMaster:FloatingCube?2", {x: 0, y: 0, z: 20.156});

        // vvv Setup players. vvv        

        // Tell the player services who is the main player and who is the remote player.
        this.proxyMessenger.postMessage(
            this.messageFactory.createRequest(this.localPlayerId, "beMainPlayer")
        );
        this.proxyMessenger.postMessage(
            this.messageFactory.createRequest(this.remotePlayerId(), "beRemotePlayer")
        );

        // Initialize players.
        await this.syncMessenger.postSyncMessage(
            this.messageFactory.createRequest(this.localPlayerId, "initialize")
        );
        await this.syncMessenger.postSyncMessage(
            this.messageFactory.createRequest(this.remotePlayerId(), "initialize")
        );

        // Spawn players.
        this.proxyMessenger.postMessage(
            this.messageFactory.createRequest("player-1", "spawn", [{x: 0, y: 0, z: 0}])
        );
        this.proxyMessenger.postMessage(
            this.messageFactory.createRequest("player-2", "spawn", [{x: 0, y: 0, z: 20}])
        );

        // Create skybox.
        this.proxyMessenger.postMessage(
            this.messageFactory.createRequest("world3d", "modify", [
                {
                    boundArgs: [],
                    f: function(this: World3D) {
                        const skybox = this.meshConstructors["SkyBox"]();
                    }
                }
            ])
        );

        // Center camera on the local player.
        setTimeout(() => {
                this.proxyMessenger.postMessage(
                    this.messageFactory.createRequest("world3d", "modify", [
                        {
                            boundArgs: [this.localPlayerId],
                            f: function(this: World3D, playerId: string) {
                                const playerBody = this.getObject(`Player:PlayerBody?${playerId}`) as PlayerBody;
                                this.camera.lockedTarget = playerBody.mainMesh;
                                // If we are player 2, then we wish to rotate the camera 180 degrees.
                                if (playerId === "player-2") {
                                    this.camera.alpha = this.camera.alpha + Math.PI
                                }
                            }
                        }
                    ])
                );
            },
            // We give some time for the Player service to create the body.
            // This is a dirty, unreliable hack and should be fixed.
            500
        );

        this.gameRunning = true;
    }

    /**
     * Create a new standard-sized cube island in the world
     * at the given position.
     */
    createCubeIsland(id: string, position: Vector3D) {
        this.proxyMessenger.postMessage({
            sender: "gameMaster",
            recipient: "world3d",
            type: "request",
            message: {
                type: "createObject",
                args: [id, "FloatingCube", {
                    boundArgs: [id, position, this.cubeSize],
                    f: function(this: World3D, id:string, position: Vector3D, cubeSize: number) {
                        return [
                            id,
                            cubeSize,
                            new this.babylonjs.Vector3(position.x, position.y, position.z),
                            this.scene
                        ];
                    }
                }]
            }
        });
    }

    /**
     * Initialization procedure for the LocalGameMaster service.
     */
    async initialize() {

        this.initialized = true;

        return true;
    }

    /**
     * In-game id of the other player, which is the remote player. 
     * We assume the game is 2-player.
     */
    remotePlayerId() {
        if (this.localPlayerId === "player-1") {
            return "player-2";
        } else {
            return "player-1";
        }
    }

    /**
     * Host a new game. Returns the code that can be used 
     * to invite other players to the game.
     */
    async hostGame() {
        const [code, localPlayerId] = (await this.syncMessenger.postSyncMessage({
            recipient: "onlineSynchronizer",
            sender: "gameMaster",
            type: "request",
            message: {
                type: "hostGame",
                args: []
            }
        }))[0] as [string, string];

        this.localPlayerId = localPlayerId;

        await this._startGame();

        return code;
    }

    /**
     * Join an existing game by using a code given by 
     * the host of the game.
     */
    async joinGame(code: string) {
        const response = (await this.syncMessenger.postSyncMessage({
            recipient: "onlineSynchronizer",
            sender: "gameMaster",
            type: "request",
            message: {
                type: "joinGame",
                args: [code]
            }
        }))[0] as string | {error: string};

        if (typeof response === "string") {
            this.localPlayerId = response;
            await this._startGame();
        }

        return response;
    }

    /**
     * When a player has died.
     */
    onPlayerDeath(playerId: string) {
        if (this.gameRunning) {
            // Pause the game engine.
            this.proxyMessenger.postMessage(
                this.messageFactory.createRequest("world3d", "pauseRenderLoop")
            );
            // Notify the service's environment that the game has ended.
            this.proxyMessenger.postMessage(
                this.messageFactory.createEvent("*", "GameMaster:<event>endGame")
            );
            // Determine whether the local player has lost or won.
            if (playerId === this.localPlayerId) {
                // Notify the environment that the local player has lost.
                this.proxyMessenger.postMessage(
                    this.messageFactory.createEvent("*", "GameMaster:<event>loseGame")
                );   
            } else {
                // Notify the environment that the local player has won.
                this.proxyMessenger.postMessage(
                    this.messageFactory.createEvent("*", "GameMaster:<event>winGame")
                );
            }
            this.gameRunning = false;
        }
    }

    /**
     * When a player other than the main local player has joined the game.
     */
    onPlayerJoined(playerId: string) {
        // We assume there are only two players, which means 
        // the game has started, since all players are present.
        this.proxyMessenger.postMessage(
            this.messageFactory.createEvent("*", "GameMaster:<event>startGame")
        );
    }
}