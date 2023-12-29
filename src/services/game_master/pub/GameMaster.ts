import EventEmitter from "../../../components/events/pub/EventEmitter";
import { DMessage } from "../../../components/messaging/pub/DMessage";
import ProxyMessenger from "../../../components/messaging/pub/ProxyMessenger";
import SyncMessenger from "../../../components/messaging/pub/SyncMessenger";
import MessageFactory from "../../../components/messaging/pub/MessageFactory";
import World3D from "../../world3d/pub/World3D";
import * as babylonjs from "@babylonjs/core";

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
    mainPlayerId: string;
    
    constructor() {
        this.syncMessenger = new SyncMessenger(this.proxyMessenger);
        this.eventHandlers = {};
        this.initialized = false;
    }

    /**
     * Spawn everything needed for the game 
     * and make the 3D world run.
     */
    private _startGame() {

        // Make world run.
        this.proxyMessenger.postMessage(
            this.messageFactory.createRequest("world3d", "run")
        );

        // vvv Create initial cube islands the players will stand on. vvv 
        
        // Register the constructor for a standard floating cube island.
        this.proxyMessenger.postMessage({
            sender: "gameMaster",
            recipient: "world3d",
            type: "request",
            message: {
                type: "registerObjectType",
                args: ["GameMaster.CubeIsland", {
                    boundArgs: [],
                    f: function(this: World3D, id:string, position: babylonjs.Vector3) {
                        var box = this.babylonjs.MeshBuilder.CreateBox(id, {size: 3}, this.scene);
                        box.position.x = position.x;
                        box.position.y = position.y;
                        box.position.z = position.z;
                        return new this.babylonjs.PhysicsAggregate(
                            box, 
                            this.babylonjs.PhysicsShapeType.BOX, 
                            { mass: 0 }, 
                            this.scene
                        );
                    }
                }]
            }
        });

        // Create the cube islands the players will spawn on.
        this.createCubeIsland("cubeIsland1", {x: 0, y: 0, z: 0});
        this.createCubeIsland("cubeIsland2", {x: 0, y: 0, z: 20});

        // vvv Setup players. vvv        

        // Tell the player services who is the main player and who is the remote player.
        this.proxyMessenger.postMessage(
            this.messageFactory.createRequest(this.mainPlayerId, "beMainPlayer")
        );
        this.proxyMessenger.postMessage(
            this.messageFactory.createRequest(this.remotePlayerId(), "beRemotePlayer")
        );

        // Spawn players.
        this.proxyMessenger.postMessage(
            this.messageFactory.createRequest("player-1", "spawn", [{x: 0, y: 4, z: 0}])
        );
        this.proxyMessenger.postMessage(
            this.messageFactory.createRequest("player-2", "spawn", [{x: 0, y: 4, z: 20}])
        );
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
                args: [id, "GameMaster.CubeIsland", {
                    boundArgs: [id, position],
                    f: function(this: World3D, id:string, position: Vector3D) {
                        return [id, new this.babylonjs.Vector3(position.x, position.y, position.z)];
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
        if (this.mainPlayerId === "player-1") {
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
        const [code, mainPlayerId] = (await this.syncMessenger.postSyncMessage({
            recipient: "onlineSynchronizer",
            sender: "gameMaster",
            type: "request",
            message: {
                type: "hostGame",
                args: []
            }
        }))[0] as [string, string];

        this.mainPlayerId = mainPlayerId;

        this._startGame();

        return code;
    }

    /**
     * Join an existing game by using a code given by 
     * the host of the game.
     */
    async joinGame(code: string) {
        this.mainPlayerId = (await this.syncMessenger.postSyncMessage({
            recipient: "onlineSynchronizer",
            sender: "gameMaster",
            type: "request",
            message: {
                type: "joinGame",
                args: [code]
            }
        }))[0] as string;

        this._startGame();

        return this.mainPlayerId;
    }
}