/**
 * Represents an arithmetic sequence of numbers.
 */
export default class ArithmeticSequence {
    constructor(start = 0, end, increment = 1) {
        this.start = start;
        this.end = end;
        this.increment = increment;
        this.currentValue = start;
    }
    /**
     * Returns the current value of the sequence without advancing to the next value.
     */
    current() {
        return this.currentValue;
    }
    /**
     * Advances the sequence to the next value and returns the updated value.
     */
    next() {
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
//# sourceMappingURL=ArithmeticSequence.js.map