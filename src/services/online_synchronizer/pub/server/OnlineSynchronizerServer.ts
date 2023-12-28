import ArithmeticSequence from "../../../../components/math/pub/ArithmeticSequence";
import { DMessage } from "../../../../components/messaging/pub/DMessage";
import Hotel from "../../../../components/messaging/pub/Hotel";
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

    constructor() {
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
    joinGame(code: string, user: string) {
        /* if (this.hotel.isInRoom(user)) {
            throw new Error("User '" + user + "' is already in a game.");
        }
        this.hotel.joinRoom(code, user); */
        return true;
    }

    /**
     * Host a new game. Returns the code that 
     * can be used to invite other players into the game.
     */
    hostGame() {
        return this.hotel.hostRoom();
    }

    /**
     * Causes user to leave the game they are in if they are in one.
     */
    leaveGame(user: string) {
        /* this.hotel.leaveAllRooms(user); */
    }

    /**
     * 
     */
    /* sendMessageInGame(user: string, msg: DMessage) {
        
    } */
}