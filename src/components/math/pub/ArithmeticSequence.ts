import ISequence from "./ISequence";

/**
 * Represents an arithmetic sequence of numbers.
 */
export default class ArithmeticSequence implements ISequence<number> {
    public currentValue: number;

    constructor(public start: number = 0, public end?: number, public increment: number = 1) {
        this.currentValue = start;
    }

    /**
     * Returns the current value of the sequence without advancing to the next value.
     */
    current(): number {
        return this.currentValue;
    }

    /**
     * Advances the sequence to the next value and returns the updated value.
     */
    next(): number {
        const currentValue = this.currentValue;
        const nextValue = currentValue + this.increment;

        // Check if an end value is specified and if the next value exceeds it
        if (this.end !== undefined && nextValue > this.end) {
            throw new Error("Sequence has reached the end");
        }

        this.currentValue = nextValue;
        return nextValue;
    }
}
