import DeepMappableObject from "../pub/DeepMappableObject";
import { expect, test } from '@jest/globals';
test("map", () => {
    var wrappee = {
        a: { b: 1 },
        c: [{ d: 2 }],
        e: { f: { g: "value" } },
        h: [3]
    };
    var obj = new DeepMappableObject(wrappee);
    obj.map((value) => typeof value === "number" ? value + 1 : value);
    expect(obj.wrappee).toEqual({
        a: { b: 2 },
        c: [{ d: 3 }],
        e: { f: { g: "value" } },
        h: [4]
    });
});
//# sourceMappingURL=DeepMappableObject.test.js.map