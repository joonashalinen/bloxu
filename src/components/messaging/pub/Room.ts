import { DMessage } from "./DMessage";
import IMessenger from "./IMessenger";
import IRoom from "./IRoom";
import Mediator from "./Mediator";

/**
 * A default implementation of IRoom.
 */
export default class Room implements IRoom {
    constructor(
        public code: string,
        public mediator = new Mediator(),
        public messengerIds = new Set<string>()
    ) {
        
    }
    
    isInRoom(messengerId: string): boolean {
        return this.messengerIds.has(messengerId);
    }

    join(messengerId: string, messenger: IMessenger<DMessage, DMessage>): IRoom {
        if (this.messengerIds.has(messengerId)) {
            throw new Error(`A messenger with id ${messengerId} already exists in Room.`);
        }        
        this.mediator.addActor(messengerId, messenger);
        this.messengerIds.add(messengerId);
        return this;
    }

    leave(messengerId: string): IRoom {
        if (!this.messengerIds.has(messengerId)) {
            throw new Error(`A messenger with id ${messengerId} does not exist in Room.`);
        }
        this.mediator.removeActor(messengerId);
        this.messengerIds.delete(messengerId);
        return this;
    }
}