import {describe, expect, test, jest} from '@jest/globals';
import Mediator from "../pub/Mediator";
import {createMessenger, testMessages} from "./MessengerClassTesting";

test("postMessage", () => {
    var [messenger, emitter, obj] = createMessenger();
    var mediator = new Mediator({"recipient1": messenger});
    mediator.postMessage(testMessages.type1)
    expect(messenger.wrappee.test.mock.calls).toEqual([["test"]]);
});

test("actor can message another actor by producing a message event", () => {
    var [messenger, emitter, obj] = createMessenger();
    var [messenger2, emitter2, obj2] = createMessenger();
    var mediator = new Mediator({"sender1": messenger, "recipient1": messenger2});
    emitter.trigger("message", [testMessages.type1]);
    expect(messenger2.wrappee.test.mock.calls).toEqual([["test"]]);
});