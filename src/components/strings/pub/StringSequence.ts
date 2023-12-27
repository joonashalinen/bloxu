import ISequence from "../../math/pub/ISequence";

/**
 * A sequence of string values.
 */
export default class StringSequence implements ISequence<string> {
    wrappee: ISequence<Object>;
    prefix: string;
    suffix: string;

    constructor(wrappee: ISequence<Object>) {
        this.wrappee = wrappee;
        this.prefix = "";
        this.suffix = "";
    }

    current(): string {
        return this.prefix + this.wrappee.current().toString() + this.suffix;
    }

    next(): string {
        return this.prefix + this.wrappee.next().toString() + this.suffix;
    }
}