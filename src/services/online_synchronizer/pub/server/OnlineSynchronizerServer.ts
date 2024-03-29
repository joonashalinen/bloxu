import ArithmeticSequence from "../../../../components/math/pub/ArithmeticSequence";
import { DMessage } from "../../../../components/messaging/pub/DMessage";
import DiscreetRoom from "../../../../components/messaging/pub/DiscreetRoom";
import Hotel from "../../../../components/messaging/pub/Hotel";
import IMessenger from "../../../../components/messaging/pub/IMessenger";
import ProxyMessenger from "../../../../components/messaging/pub/ProxyMessenger";
import StringSequence from "../../../../components/strings/pub/StringSequence";

/**
 * Contains the operations and state of the 
 * OnlineSynchronizerServer service.
 */
export default class OnlineSynchronizerServer {
    playerIdGenerator = new StringSequence(new ArithmeticSequence());
    hotel = new Hotel();
    proxyMessenger = new ProxyMessenger<DMessage, DMessage>();
    gameParticipantHistory: {[code: string]: string[]} = {};

    constructor() {
        this.hotel.createRoom = (code: string) => {
            const room = new DiscreetRoom(code);
            const aliasGenerator = new StringSequence(new ArithmeticSequence());
            aliasGenerator.prefix = "player-";
            room.aliasGenerator = aliasGenerator;
            return room;
        };
    }

    /**
     * Generate new unique player id.
     */
    newPlayerId() {
        return this.playerIdGenerator.next();
    }

    /**
     * Join a game using a code given by the host of the game.
     */
    joinGame(code: string, player: string, messenger: IMessenger<DMessage, DMessage>) {
        if (this.hotel.isInRoom(player)) {
            throw new Error("Player '" + player + "' is already in a game.");
        }
        if (!(this.hotel.roomWithCodeExists(code))) {
            throw new Error("Trying to join a non-existent game: " + code);
        }
        // FIX THIS: Here we assume that a game has started if it has 
        // two players that have joined it. This assumption may change in the future.
        if (this.gameParticipantHistory[code].length > 1) {
            throw new Error("Trying to join a game that has already started.");
        }
        const joined = this.hotel.joinRoom(code, player, messenger);
        if (!joined) {
            throw new Error("Could not join room.");
        } else {
            this.gameParticipantHistory[code].push(player);
            return this.playerIdInGame(player);
        }
    }

    /**
     * Host a new game. Returns the code that 
     * can be used to invite other players into the game.
     */
    hostGame() {
        const code = this.hotel.hostRoom();
        this.gameParticipantHistory[code] = [];
        return code;
    }

    /**
     * Causes player to leave the game they are in if they are in one.
     */
    leaveGame(player: string) {
        this.hotel.leaveAllRooms(player);
        return true;
    }

    /**
     * The id of the player within the game they are in if they 
     * are in one. For example, the first person to join the game is 'player-1'.
     */
    playerIdInGame(player: string) {
        const room = this.hotel.rooms.find((r) => r.isInRoom(player));
        if (room === undefined) {
            throw new Error(`Player ${player} is not currently in any game`);
        } else {
            console.log((room as DiscreetRoom).aliases[player]);
            return (room as DiscreetRoom).aliases[player];
        }
    }
}