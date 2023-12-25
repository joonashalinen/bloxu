import {describe, expect, test, jest} from '@jest/globals';
import MessengerClass from "../pub/MessengerClass";
import EventEmitter from '../../events/pub/EventEmitter';
import {DMessage} from "../pub/DMessage";

type TestObj = {test: jest.Mock};

export function createMessenger(): [MessengerClass<TestObj>, EventEmitter, TestObj] {
    var obj = {test: jest.fn()};
    var emitter = new EventEmitter();
    var messenger = new MessengerClass(obj, emitter);
    return [messenger, emitter, obj];
}

export var testMessages = {
    "type1": {type: "request", message: {type: "test", args: ["test"]}} as DMessage
};