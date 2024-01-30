import {IMediator} from "./IMediator";
import IMessenger from "./IMessenger";
import EventEmitter from "../../events/pub/EventEmitter";
import {DMessage} from "./DMessage";
import IEventable from "../../events/pub/IEventable";

type Actor = IMessenger<DMessage, DMessage>;
type Actors = {[name: string]: Actor};

/**
 * Default implementation for IMediator. Facilitates sending messages 
 * between different actors which all implement the IMessenger interface.
 */
export default class Mediator implements IMediator, IEventable {
    emitter: EventEmitter;
    actors: Actors;
    actorListeners: {[actor: string]: (msg: DMessage) => void}

    constructor(actors: Actors = {}) {
        this.emitter = new EventEmitter();
        this.actors = actors;
        this.actorListeners = {};
        
        for (let actorName in actors) {
            let actor = actors[actorName];
            this._listenToActor(actorName, actor);
        }
    }

    /**
     * Set up message listener for given actor. When the actor 
     * emits a message, it is posted to the actors it is directed to.
     */
    _listenToActor(name: string, actor: Actor): void {
        const listener = (msg: DMessage) => {
            // We catch and trigger errors here so that the user of the 
            // Mediator can know when an error has occurred during 
            // inter-messenger communication.
            try {
                this.postMessage(msg, name);
            } catch (e) {
                this.emitter.trigger("error", [e, name, msg]);
            }
        };
        this.actorListeners[name] = listener;
        actor.onMessage(listener);
    }

    /**
     * Post message to actor and trigger our own event 
     * to signal that the message has been sent to all that may be 
     * interested in this fact.
     */
    _postActorMessage(name: string, actor: Actor, msg: DMessage): void {
        actor.postMessage(msg);
        this.emitter.trigger(name, [msg]);
    }

    addActor(id: string, actor: Actor) {
        if (id in this.actors) {
            throw new Error("Actor with given id '" + id + "' already exists.");
        }
        this.actors[id] = actor;
        this._listenToActor(id, actor);
        return this;
    }

    removeActor(id: string) {
        if (!(id in this.actors)) {
            throw new Error("Actor with given id '" + id +  "' does not exist.");
        }
        const actor = this.actors[id];
        delete this.actors[id];

        actor.offMessage(this.actorListeners[id]);
        delete this.actorListeners[id];
        
        return this;
    }

     /**
      * Listen to messages sent to given actor. Note: use this method only to listen 
      * to actors other than yourself. An actor does not need to explicitly 
      * listen to its own message events, since they will automatically receive 
      * messages sent to them via .postMessage() simply by being a part of the Mediator's actors.
      * Consequently, only listen to messages for '*' (all actors) if you are not an actor.
      */
    onMessageFor(actor: string, handler: (msg: DMessage) => void): Mediator {
        if (!(actor in this.actors)) {
            throw new Error("No actor '" + actor + "' found");
        }
        this.emitter.on(actor, handler);
        return this;
    }

    offMessageFor(actor: string, handler: (msg: DMessage) => void): Mediator {
        this.emitter.off(actor, handler);
        return this;
    }

    postMessage(msg: DMessage, callerActor?: string): Mediator {
        if (msg.recipient === "*") {
            for (let actorName in this.actors) {
                if (actorName !== callerActor) {
                    let actor = this.actors[actorName];
                    this._postActorMessage(actorName, actor, msg);
                }
            }
        } else {
            // '-' is a name used by the sender of a message when they do not 
            // want to receive a response or are not a messenger in the Mediator 
            // (and thus cannot receive response). Thus, when the recipient is 
            // '-' this means that a service has sent a response to such a sender. 
            // In this case, we do not want to cause an error but simply ignore it.
            if (msg.recipient !== "-") {
                if (!(msg.recipient in this.actors)) {
                    throw new Error("No actor '" + msg.recipient + "' found");
                }
                var actor = this.actors[msg.recipient];
                this._postActorMessage(msg.recipient, actor, msg);
            }
        }
        return this;
    }

    onMessage(handler: (msg: DMessage) => void): Mediator {
        return this.onMessageFor("*", handler);
    }

    offMessage(handler: (msg: DMessage) => void): Mediator {
        return this.offMessageFor("*", handler);
    }
}