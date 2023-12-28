"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ArithmeticSequence_1 = require("../../math/pub/ArithmeticSequence");
var StringSequence_1 = require("../../strings/pub/StringSequence");
var Mediator_1 = require("./Mediator");
var Room_1 = require("./Room");
/**
 * An IRoom where the ids within the room
 * are pseudonymous ids that are newly generated
 * for each messenger joining the room.
 */
var DiscreetRoom = /** @class */ (function () {
    function DiscreetRoom(code, mediator, messengerIds) {
        if (mediator === void 0) { mediator = new Mediator_1.default(); }
        if (messengerIds === void 0) { messengerIds = new Set(); }
        this.code = code;
        this.mediator = mediator;
        this.messengerIds = messengerIds;
        this.aliasGenerator = new StringSequence_1.default(new ArithmeticSequence_1.default());
        this.aliases = {};
        this.room = new Room_1.default(code, mediator, messengerIds);
    }
    DiscreetRoom.prototype.isInRoom = function (messengerId) {
        var alias = this.aliases[messengerId];
        return (alias !== undefined && this.room.isInRoom(alias));
    };
    DiscreetRoom.prototype.join = function (messengerId, messenger) {
        if (this.aliases[messengerId] !== undefined) {
            throw new Error("A messenger with id ".concat(messengerId, " already exists in Room."));
        }
        var alias = this.aliasGenerator.next();
        this.aliases[messengerId] = alias;
        this.room.join(alias, messenger);
        return this;
    };
    DiscreetRoom.prototype.leave = function (messengerId) {
        if (this.aliases[messengerId] === undefined) {
            throw new Error("A messenger with id ".concat(messengerId, " does not exist in Room."));
        }
        var alias = this.aliases[messengerId];
        delete this.aliases[messengerId];
        this.room.leave(alias);
        return this;
    };
    return DiscreetRoom;
}());
exports.default = DiscreetRoom;
