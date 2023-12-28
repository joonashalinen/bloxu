import EventEmitter from "../../../components/events/pub/EventEmitter";
import ArithmeticSequence from "../../math/pub/ArithmeticSequence";
import StringSequence from "../../strings/pub/StringSequence";
import { DMessage } from "./DMessage";
import IMessenger from "./IMessenger";
import Mediator from "./Mediator";
import IRoom from "./IRoom";
import Room from "./Room";

/**
 * Provides the ability to create private rooms 
 * for messaging between IMessengers. IMessengers can
 * either host their own rooms or join existing rooms 
 * via a code shared by the room's host.
 */
export default class Hotel {
    rooms: IRoom[] = [];
    mediator = new Mediator();
    emitter = new EventEmitter();
    createRoom = (code: string) => new Room(code);

    constructor() {

    }

    /**
     * Whether given messenger is already in a room.
     */
    isInRoom(messengerId: string) {
        const room = this.rooms.find((r) => r.isInRoom(messengerId));
        return (room !== undefined);
    }

    /**
     * Whether there is a room that can be joined with the given code.
     */
    roomWithCodeExists(code: string) {
        const room = this.rooms.find((r) => r.code === code);
        return (room !== undefined);
    }

    /**
     * Host a new room and return the room code.
     */
    hostRoom(): string {
        const code = this.generateRoomCode();
        const newRoom = this.createRoom(code);
        this.rooms.push(newRoom);
        return code;
    }

    /**
     * Join an existing room using the provided room code.
     * Returns true if the join was successful, false otherwise.
     */
    joinRoom(code: string, messengerId: string, messenger: IMessenger<DMessage, DMessage>): boolean {
        const room = this.rooms.find((r) => r.code === code);
        if (room !== undefined) {
            room.join(messengerId, messenger);
            return true;
        } else {
            return false;
        }
    }

    /**
     * Removes messenger from all rooms they are in if they are in any.
     */
    leaveAllRooms(messengerId: string): boolean {
        const rooms = this.rooms.filter((r) => r.isInRoom(messengerId));
        rooms.forEach((room) => {
            if (room) {
                room.leave(messengerId);
            }
        });
        return true;
    }

    /**
     * Generate a random room code.
     */
    private generateRoomCode(): string {
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        const codeLength = 6;
        let code = "";

        for (let i = 0; i < codeLength; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            code += characters[randomIndex];
        }

        if (this.rooms.find((room) => room.code === code)) {
            return this.generateRoomCode();
        } else {
            return code;
        }
    }
}
