"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EventEmitter_1 = require("../../events/pub/EventEmitter");
/**
 * Default implementation for IMediator. Facilitates sending messages
 * between different actors which all implement the IMessenger interface.
 */
var Mediator = /** @class */ (function () {
    function Mediator(actors) {
        if (actors === void 0) { actors = {}; }
        this.emitter = new EventEmitter_1.default();
        this.actors = actors;
        for (var actorName in actors) {
            var actor = actors[actorName];
            this._listenToActor(actorName, actor);
        }
    }
    /**
     * Set up message listener for given actor. When the actor
     * emits a message, it is posted to the actors it is directed to.
     */
    Mediator.prototype._listenToActor = function (name, actor) {
        var _this = this;
        actor.onMessage(function (msg) { return _this.postMessage(msg, name); });
    };
    /**
     * Post message to actor and trigger our own event
     * to signal that the message has been sent to all that may be
     * interested in this fact.
     */
    Mediator.prototype._postActorMessage = function (name, actor, msg) {
        actor.postMessage(msg.message);
        this.emitter.trigger(name, [msg]);
    };
    /**
     * Listen to messages sent to given actor. Note: use this method only to listen
     * to actors other than yourself. An actor does not need to explicitly
     * listen to its own message events, since they will automatically receive
     * messages sent to them via .postMessage() simply by being a part of the Mediator's actors.
     * Consequently, only listen to messages for '*' (all actors) if you are not an actor.
     */
    Mediator.prototype.onMessageFor = function (actor, handler) {
        if (!(actor in this.actors)) {
            throw new Error("No actor '" + actor + "' found");
        }
        this.emitter.on(actor, handler);
        return this;
    };
    Mediator.prototype.postMessage = function (msg, callerActor) {
        if (msg.recipient === "*") {
            for (var actorName in this.actors) {
                if (actorName !== callerActor) {
                    var actor_1 = this.actors[actorName];
                    this._postActorMessage(actorName, actor_1, msg);
                }
            }
        }
        else {
            if (!(msg.recipient in this.actors)) {
                throw new Error("No actor '" + msg.recipient + "' found");
            }
            var actor = this.actors[msg.recipient];
            this._postActorMessage(msg.recipient, actor, msg);
        }
        return this;
    };
    Mediator.prototype.onMessage = function (handler) {
        return this.onMessageFor("*", handler);
    };
    return Mediator;
}());
exports.default = Mediator;