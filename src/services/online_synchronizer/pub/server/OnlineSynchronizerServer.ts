import { DMessage } from "../../../../components/messaging/pub/DMessage";
import MessageHotel from "../../../../components/messaging/pub/MessageHotel";
import ProxyMessenger from "../../../../components/messaging/pub/ProxyMessenger";

/**
 * Contains the operations and state of the 
 * OnlineSynchronizerServer service.
 */
export default class OnlineSynchronizerServer {
    private _runningPlayerId = 1;
    messageHotel = new MessageHotel();
    proxyMessenger = new ProxyMessenger<DMessage, DMessage>();

    constructor() {
    }
    
    /**
     * Generates a new player id.
     */
    newPlayerId(): string {
        var id = this._runningPlayerId.toString();
        this._runningPlayerId = this._runningPlayerId + 1;
        return id;
    }

    /**
     * Join a game using a code given by the host of the game.
     */
    joinGame(code: string, user: string) {
        this.messageHotel.joinRoom(code, user);
        return true;
    }

    /**
     * Host a new game. Returns the code that 
     * can be used to invite other players into the game.
     */
    hostGame() {
        return this.messageHotel.hostRoom();
    }
}