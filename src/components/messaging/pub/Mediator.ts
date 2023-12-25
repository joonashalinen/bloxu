import DMediatorMessage from "./DMediatorMessage";
import {IMediator} from "./IMediator";
import IMessenger from "./IMessenger";
import EventEmitter from "../../events/pub/EventEmitter";

type Actor = IMessenger<unknown, unknown>;
type Actors = {[name: string]: Actor};

/**
 * Default implementation for IMediator. Facilitates sending messages 
 * between different actors which all implement the IMessenger interface.
 */
export default class Mediator implements IMediator<unknown, unknown> {
    emitter: EventEmitter;
    actors: Actors;

    /**
     * Set up message listener for given actor. When the actor 
     * emits a message, it is posted to the actors it is directed to.
     */
    _listenToActor(name: string, actor: Actor): void {
        actor.onMessage((msg: DMediatorMessage<unknown>) => this.postMessage(msg, name));
    }

    /**
     * Post message to actor and trigger our own event 
     * to signal that the message has been sent to all that may be 
     * interested in this fact.
     */
    _postActorMessage(name: string, actor: Actor, msg: DMediatorMessage<unknown>): void {
        actor.postMessage(msg.message);
        this.emitter.trigger(name, [msg]);
    }

    constructor(actors: Actors = {}) {
        this.emitter = new EventEmitter();
        this.actors = actors;
        for (let actorName in actors) {
            let actor = actors[actorName];
            this._listenToActor(actorName, actor);
        }
    }

     /**
      * Listen to messages sent to given actor. Note: use this method only to listen 
      * to actors other than yourself. An actor does not need to explicitly 
      * listen to its own message events, since they will automatically receive 
      * messages sent to them via .postMessage() simply by being a part of the Mediator's actors.
      * Consequently, only listen to messages for '*' (all actors) if you are not an actor.
      */
    onMessageFor(actor: string, handler: (msg: DMediatorMessage<unknown>) => void): IMediator<unknown, unknown> {
        if (!(actor in this.actors)) {
            throw new Error("No actor '" + actor + "' found");
        }
        this.emitter.on(actor, handler);
        return this;
    }

    postMessage(msg: DMediatorMessage<unknown>, callerActor?: string): IMediator<unknown, unknown> {
        if (msg.recipient === "*") {
            for (let actorName in this.actors) {
                if (actorName !== callerActor) {
                    let actor = this.actors[actorName];
                    this._postActorMessage(actorName, actor, msg);
                }
            }
        } else {
            if (!(msg.recipient in this.actors)) {
                throw new Error("No actor '" + msg.recipient + "' found");
            }
            var actor = this.actors[msg.recipient];
            this._postActorMessage(msg.recipient, actor, msg);
        }
        return this;
    }

    onMessage(handler: (msg: DMediatorMessage<unknown>) => void): IMediator<unknown, unknown> {
        return this.onMessageFor("*", handler);
    }
}