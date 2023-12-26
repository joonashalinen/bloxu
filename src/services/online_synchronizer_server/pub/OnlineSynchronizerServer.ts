import EventEmitter from "../../../components/events/pub/EventEmitter";
import MessageHotel from "../../../components/messaging/pub/MessageHotel";

/**
 * Contains the operations and state of the 
 * OnlineSynchronizerServer service.
 */
export default class OnlineSynchronizerServer {
    private _runningPlayerId = 1;
    messageHotel: MessageHotel;
    emitter: EventEmitter;

    constructor() {
        this.messageHotel = new MessageHotel();
        this.emitter = new EventEmitter();
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
        console.log("code")
        console.log(code)
        console.log("user")
        console.log(user)
        this.messageHotel.joinRoom(code, user);
        return this;
    }

    /**
     * Host a new game. Returns the code that 
     * can be used to invite other players into the game.
     */
    hostGame() {
        return this.messageHotel.hostRoom();
    }
}