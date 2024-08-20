
export default class Action<T> {
    constructor(public target: T,
        public performer: (target: T) => void,
        public undoer: (target: T) => void) {

    }

    /**
     * Does the action on the target.
     */
    perform() {
        this.performer(this.target);
    }

    /**
     * Undoes the action.
     */
    undo() {
        this.undoer(this.target);
    }
}