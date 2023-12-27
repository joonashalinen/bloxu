/**
 * Provides the ability to transform a given function
 * into a string and vice versa.
 */
export default class EncodeableFunction {
    constructor(f) {
        this.wrappee = f;
    }
    /**
     * The function as a string.
     */
    encode() {
        if (typeof this.wrappee === "function") {
            return "return (" + this.wrappee.toString() + ")";
        }
        else {
            return this.wrappee;
        }
    }
    /**
     * The function as a Function.
     */
    decode() {
        if (typeof this.wrappee === "string") {
            return (new Function(this.wrappee))();
        }
        else {
            return this.wrappee;
        }
    }
}
//# sourceMappingURL=EncodeableFunction.js.map