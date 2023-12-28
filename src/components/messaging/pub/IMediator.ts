import {DMessage} from "./DMessage";
import IMessenger from "./IMessenger";

/**
 * Object that serves as an intermediate 
 * for facilitating message sending between different parties.
 */
export interface IMediator extends IMessenger<DMessage, DMessage> {
    actors: {[name: string]: IMessenger<DMessage, DMessage>};
    /**
     * Listen only to messages for actor with given name.
     */
    onMessageFor(actor: string, handler: (msg: DMessage) => void): IMediator;
    /**
     * Remove onMessageFor listener with given handler.
     */
    offMessageFor(actor: string, handler: (msg: DMessage) => void): IMediator;
    /**
     * Add new actor with given id into the Mediator if one does not 
     * already exist with the same id.
     */
    addActor(id: string, actor: IMessenger<DMessage, DMessage>): IMediator;

     /**
     * Remove actor with given id.
     */
    removeActor(id: string): IMediator;
}