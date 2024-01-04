
/**
 * A typical moving average.
 */
export default class MovingAverage {
    values: number[] = [];

    constructor(public size: number) {
        
    }

    /**
     * Add a value to the moving average.
     */
    observe(value: number) {
        this.values.push(value);
        if (this.values.length > this.size) {
            this.values.shift();
        }
        return this;
    }

    /**
     * Get the moving average value as a number.
     */
    get() {
        if (this.values.length > 0) {
            const sum = this.values.reduce((a, b) => a + b);
            return sum / this.values.length;
        } else {
            return 0;
        }
    }
}