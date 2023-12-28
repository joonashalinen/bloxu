"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Mediator_1 = require("./Mediator");
/**
 * A default implementation of IRoom.
 */
var Room = /** @class */ (function () {
    function Room(code, mediator, messengerIds) {
        if (mediator === void 0) { mediator = new Mediator_1.default(); }
        if (messengerIds === void 0) { messengerIds = new Set(); }
        this.code = code;
        this.mediator = mediator;
        this.messengerIds = messengerIds;
    }
    Room.prototype.isInRoom = function (messengerId) {
        return this.messengerIds.has(messengerId);
    };
    Room.prototype.join = function (messengerId, messenger) {
        if (this.messengerIds.has(messengerId)) {
            throw new Error("A messenger with id ".concat(messengerId, " already exists in Room."));
        }
        this.mediator.addActor(messengerId, messenger);
        this.messengerIds.add(messengerId);
        return this;
    };
    Room.prototype.leave = function (messengerId) {
        if (!this.messengerIds.has(messengerId)) {
            throw new Error("A messenger with id ".concat(messengerId, " does not exist in Room."));
        }
        this.mediator.removeActor(messengerId);
        this.messengerIds.delete(messengerId);
        return this;
    };
    return Room;
}());
exports.default = Room;
