/**
 * A sequence of string values.
 */
export default class StringSequence {
    constructor(wrappee) {
        this.wrappee = wrappee;
        this.prefix = "";
        this.suffix = "";
    }
    current() {
        return this.prefix + this.wrappee.current().toString() + this.suffix;
    }
    next() {
        return this.prefix + this.wrappee.next().toString() + this.suffix;
    }
}
//# sourceMappingURL=StringSequence.js.map