
/**
 * A sequence of values. Most likely implemented as a 
 * generator that will produce new values each time the 
 * sequence is advanced.
 */
export default interface ISequence<T> {
    /**
     * Current value. Does not increment to the next value.
     */
    current(): T;

    /**
     * Generate next value.
     */
    next(): T;
}