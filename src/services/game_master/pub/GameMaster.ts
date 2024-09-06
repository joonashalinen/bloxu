import { DMessage } from "../../../components/messaging/pub/DMessage";
import ProxyMessenger from "../../../components/messaging/pub/ProxyMessenger";
import SyncMessenger from "../../../components/messaging/pub/SyncMessenger";
import MessageFactory from "../../../components/messaging/pub/MessageFactory";
import World3D from "../../world3d/pub/World3D";
import Channel from "../../../components/messaging/pub/Channel";
import LevelLogic from "../prv/LevelLogic";
import createLevelLogic from "../conf/level_logic";
import getPlayers, { IPlayerInfo } from "../conf/players";

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
    levelLogic: LevelLogic;
    worldChannel: Channel;
    players: IPlayerInfo[];
    isOnlineGame: boolean = false;
    
    constructor() {
        this.syncMessenger = new SyncMessenger(this.proxyMessenger);
        this.worldChannel = new Channel("gameMaster", "world3d", this.proxyMessenger);
        this.players = getPlayers();
        this.eventHandlers = {
            "Player:<event>die": this.onPlayerDeath.bind(this),
            "OnlineSynchronizer:<event>remotePlayerJoined": this.onPlayerJoined.bind(this),
            "*": this.onAnyEvent.bind(this)
        };
        this.initialized = false;
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
        if (this.localPlayerId === this.players[0].id) {
            return this.players[1].id;
        } else {
            return this.players[0].id;
        }
    }

    /**
     * Host a new game. Returns the code that can be used 
     * to invite other players to the game.
     */
    async hostGame() {
        const [code, localPlayerId] = await this.syncMessenger.postSyncMessage({
            recipient: "onlineSynchronizer",
            sender: "gameMaster",
            type: "request",
            message: {
                type: "hostGame",
                args: []
            }
        }) as [string, string];

        this.localPlayerId = localPlayerId;
        this.isOnlineGame = true;

        await this._startGame();

        return code;
    }

    /**
     * Starts a local game against an AI opponent.
     */
    async startLocalGame() {
        const [code, localPlayerId] = await this.syncMessenger.postSyncMessage({
            recipient: "onlineSynchronizer",
            sender: "gameMaster",
            type: "request",
            message: {
                type: "hostGame",
                args: []
            }
        }) as [string, string];

        this.localPlayerId = localPlayerId;
        this.isOnlineGame = false;

        await this._startGame(true);

        return true;
    }

    /**
     * Join an existing game by using a code given by 
     * the host of the game.
     */
    async joinGame(code: string) {
        const response = await this.syncMessenger.postSyncMessage({
            recipient: "onlineSynchronizer",
            sender: "gameMaster",
            type: "request",
            message: {
                type: "joinGame",
                args: [code]
            }
        }) as string | {error: string};

        this.isOnlineGame = true;

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

    /**
     * Fallback for any event that does not 
     * have a specific handler.
     */
    onAnyEvent(msg: DMessage) {
        if (!this.gameRunning) return;
        this.levelLogic.handleEvent(msg.message.type, msg.message.args);
    }

    /**
     * Spawn everything needed for the game 
     * and make the 3D world run.
     */
    private async _startGame(isSinglePlayer: boolean = false) {

        this.levelLogic = createLevelLogic(this.proxyMessenger, this.isOnlineGame);

        // vvv Setup environment. vvv

        // Make world run.
        await this.worldChannel.request("run");

        // Create map.
        await this.worldChannel.request("selectMap", 
            [this.levelLogic.levels[this.levelLogic.currentLevelIndex]]);

        // vvv Setup players. vvv        

        // Tell the player services who is the main player and who is the remote / AI player.
        this.proxyMessenger.postMessage(
            this.messageFactory.createRequest(this.localPlayerId,
                "beCreature", ["PlayerBody", true])
        );
        this.proxyMessenger.postMessage(
            this.messageFactory.createRequest(this.remotePlayerId(),
                !isSinglePlayer ? "beRemoteCreature" : "beCreature", ["PlayerBody"])
        );

        // Initialize players.
        await this.syncMessenger.postSyncMessage(
            this.messageFactory.createRequest(this.localPlayerId, "initialize")
        );
        await this.syncMessenger.postSyncMessage(
            this.messageFactory.createRequest(this.remotePlayerId(), "initialize")
        );

        // Initialize coordinator service for the players.
        await this.syncMessenger.postSyncMessage(
            this.messageFactory.createRequest(
                "playerCoordinator", "initialize",
                [this.players.map((player) => player.id),
                    this.localPlayerId === this.players[0].id ? 0 : 1]
            )
        );

        // Spawn players.
        for (let i = 0; i < this.players.length; i++) {
            const player = this.players[i];
            await this.syncMessenger.postSyncMessage(
                this.messageFactory.createRequest(player.id, "spawn", [player.spawnLocation])
            );
        }

        // vvv Setup level change logic. vvv

        await this.levelLogic.handleStartLevel();

        // Setup event listener for when the level ends and the map should change.
        this.levelLogic.onEndLevel(async (nextLevelId: string | undefined) => {
            if (nextLevelId !== undefined) {
                // Pause player services to make sure they don't handle inputs
                // while we are resetting the world and the creatures's
                // controllers and bodies in the world.
                for (let i = 0; i < this.players.length; i++) {
                    await this.syncMessenger.postSyncMessage(
                        this.messageFactory.createRequest(this.players[i].id, "pause")
                    );
                }
                // Select next map.
                await this.worldChannel.request("selectMap", [nextLevelId]);
                // Respawn players.
                this.players.forEach((player) => {
                    this.proxyMessenger.postMessage(
                        this.messageFactory.createRequest(player.id, "respawn", [player.spawnLocation])
                    );
                });
                // Reset level change logic.
                await this.levelLogic.handleEndLevel();
                await this.levelLogic.handleStartLevel();
                // Resume player services.
                for (let i = 0; i < this.players.length; i++) {
                    await this.syncMessenger.postSyncMessage(
                        this.messageFactory.createRequest(this.players[i].id, "resume")
                    );
                }
            }
        });

        this.gameRunning = true;
    }
}