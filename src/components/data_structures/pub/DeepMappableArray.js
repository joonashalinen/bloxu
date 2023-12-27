import DeepMappableObject from "./DeepMappableObject";
import VariableType from "../../types/VariableType";
/**
 * Provides deep mapping for plain javascript arrays.
 */
export default class DeepMappableArray {
    constructor(wrappee) {
        this.wrappee = wrappee;
    }
    map(transformer) {
        this.wrappee = this.wrappee.map((value) => {
            if (Array.isArray(value)) {
                return (new DeepMappableArray(value)).map(transformer).wrappee;
            }
            else if ((new VariableType(value)).isRealObject()) {
                return (new DeepMappableObject(value)).map(transformer).wrappee;
            }
            else {
                return transformer(value);
            }
        });
        return this;
    }
}
//# sourceMappingURL=DeepMappableArray.js.map