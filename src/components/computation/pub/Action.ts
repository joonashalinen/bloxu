
export default class Action<Target, Context> {
    constructor(public target: Target,
        public context: Context,
        public performer: (target: Target, context: Context) => void,
        public undoer: (target: Target, context: Context) => void) {

    }

    /**
     * Does the action on the target.
     */
    perform() {
        this.performer(this.target, this.context);
    }

    /**
     * Undoes the action.
     */
    undo() {
        this.undoer(this.target, this.context);
    }
}