import EventEmitter from "../../../components/events/pub/EventEmitter";

interface Room {
    code: string;
    users: string[];
}

interface Message {
    sender: string;
    content: string;
}

/**
 * Provides the ability to create private rooms 
 * for messaging between users. Users can join existing rooms 
 * via a code shared by the room's host.
 */
export default class MessageHotel {
    rooms: Room[];
    emitter: EventEmitter;

    constructor() {
        this.rooms = [];
        this.emitter = new EventEmitter();
    }

    /**
     * Host a new room and return the room code.
     */
    hostRoom(): string {
        const code = this.generateRoomCode();
        const newRoom: Room = {
            code,
            users: []
        };
        this.rooms.push(newRoom);
        return code;
    }

    /**
     * Join an existing room using the provided room code.
     * Returns true if the join was successful, false otherwise.
     */
    joinRoom(code: string, user: string): boolean {
        const room = this.rooms.find((r) => r.code === code);
        if (room) {
            room.users.push(user);
            return true;
        } else {
            return false;
        }
    }

    /**
     * Send a message from one user to another within the same room.
     */
    sendMessage(sender: string, roomCode: string, content: string): void {
        const room = this.rooms.find((room) => room.code === roomCode);
        
        if (room && room.users.includes(sender)) {
            const message: Message = {
                sender,
                content
            };

            this.emitter.trigger(
                `message`, 
                [{recipient: room.code, message: message}]
            );
        } else {
            // Handle invalid sender, recipient, or rooms
        }
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
