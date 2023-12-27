import {describe, expect, test, jest} from '@jest/globals';
import MessengerClass from "../pub/MessengerClass";
import ProxyMessenger from "../pub/ProxyMessenger";
import {DMessage} from "../pub/DMessage";

type TestObj = {test: jest.Mock};

export function createMessenger(): 
    [MessengerClass<TestObj>, ProxyMessenger<DMessage, DMessage>, TestObj] 
{
    var obj = {test: jest.fn()};
    var proxy = new ProxyMessenger<DMessage, DMessage>();
    var messenger = new MessengerClass(obj, proxy);
    return [messenger, proxy, obj];
}

export var testMessages = {
    "type1": {
        sender: "sender1",
        recipient: "recipient1",
        type: "request", 
        message: {
            type: "test", 
            args: ["test"]
        }
    } as DMessage
};