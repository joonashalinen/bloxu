"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Represents an arithmetic sequence of numbers.
 */
var ArithmeticSequence = /** @class */ (function () {
    function ArithmeticSequence(start, end, increment) {
        if (start === void 0) { start = 0; }
        if (increment === void 0) { increment = 1; }
        this.start = start;
        this.end = end;
        this.increment = increment;
        this.currentValue = start;
    }
    /**
     * Returns the current value of the sequence without advancing to the next value.
     */
    ArithmeticSequence.prototype.current = function () {
        return this.currentValue;
    };
    /**
     * Advances the sequence to the next value and returns the updated value.
     */
    ArithmeticSequence.prototype.next = function () {
        var currentValue = this.currentValue;
        var nextValue = currentValue + this.increment;
        // Check if an end value is specified and if the next value exceeds it
        if (this.end !== undefined && nextValue > this.end) {
            throw new Error("Sequence has reached the end");
        }
        this.currentValue = nextValue;
        return nextValue;
    };
    return ArithmeticSequence;
}());
exports.default = ArithmeticSequence;
