
/**
 * Provides the ability to transform a given function 
 * into a string and vice versa.
 */
export default class EncodeableFunction {
    wrappee: Function | string;
    constructor(f: Function | string) {
        this.wrappee = f;
    }
    /**
     * The function as a string.
     */
    encode(): string {
        if (typeof this.wrappee === "function") {
            return "return (" + this.wrappee.toString() + ")";
        } else {
            return this.wrappee;
        }
    }

    /**
     * The function as a Function.
     */
    decode(): Function {
        if (typeof this.wrappee === "string") {
            return (new Function(this.wrappee))();
        } else {
            return this.wrappee;
        }
    }
}