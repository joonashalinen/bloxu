import DeepMappableArray from "./DeepMappableArray";
import VariableType from "../../types/VariableType";
/**
 * Provides deep mapping for plain javascript objects.
 */
export default class DeepMappableObject {
    constructor(wrappee) {
        this.wrappee = wrappee;
    }
    /**
     * Deep map through all the object's values. Deep maps through nested arrays as well.
     */
    map(transformer) {
        var copyObj = {};
        for (let propName in this.wrappee) {
            let prop = this.wrappee[propName];
            if (Array.isArray(prop)) {
                copyObj[propName] = (new DeepMappableArray(prop)).map(transformer).wrappee;
            }
            else if ((new VariableType(prop)).isRealObject()) {
                copyObj[propName] = (new DeepMappableObject(prop)).map(transformer).wrappee;
            }
            else {
                copyObj[propName] = transformer(prop);
            }
        }
        this.wrappee = copyObj;
        return this;
    }
}
//# sourceMappingURL=DeepMappableObject.js.map