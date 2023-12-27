import DeepMappableArray from "../pub/DeepMappableArray";
import { expect, test } from '@jest/globals';
test("map", () => {
    var wrappee = [{ a: 1 }, { b: [{ c: 2 }] }];
    var obj = new DeepMappableArray(wrappee);
    obj.map((value) => typeof value === "number" ? value + 1 : value);
    expect(obj.wrappee).toEqual([{ a: 2 }, { b: [{ c: 3 }] }]);
});
//# sourceMappingURL=DeepMappableArray.test.js.map