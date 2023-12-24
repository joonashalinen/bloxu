import {describe, expect, test, jest} from '@jest/globals';
import Mediator from "../pub/Mediator";
import {createMessenger} from "./types";

test("postMessage", () => {
    var [messenger, emitter, obj] = createMessenger();
    var mediator = new Mediator({"test": messenger});
    mediator.postMessage({
        recipient: "test",
        message: {method: "test", args: ["test"]}
    })
    expect(messenger.wrappee.test.mock.calls).toEqual([["test"]]);
});

test("actor can message another actor by producing a message event", () => {
    var [messenger, emitter, obj] = createMessenger();
    var [messenger2, emitter2, obj2] = createMessenger();
    var mediator = new Mediator({"1": messenger, "2": messenger2});
    emitter.trigger("message", [{
        recipient: "2",
        message: {method: "test", args: ["test"]}
    }]);
    expect(messenger2.wrappee.test.mock.calls).toEqual([["test"]]);
});