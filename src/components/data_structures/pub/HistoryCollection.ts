import Action from "../../computation/pub/Action";
import History from "./History";

/**
 * A collection of uniquely identified History objects 
 * with useful operations for them.
 */
export default class HistoryCollection<Target, Context> {
    readonly histories: {[id: string]: History<Target, Context>} = {};
    readonly touchedHistories: {[id: string]: History<Target, Context>} = {};

    constructor() {
        
    }

    /**
     * Sets the history at the given id to the given value.
     */
    setHistory(id: string, history: History<Target, Context>) {
        this.histories[id] = history;
        history.onPerformAction(() => {
            this.touchedHistories[id] = history;
        });
    }

    /**
     * Whether an object with the given id has been touched, i.e. 
     * it has some kind of recorded history.
     */
    isTouched(historyId: string) {
        return this.touchedHistories[historyId] !== undefined;
    }

    perform(action: Action<Target, Context>, historyId: string) {
        if (this.histories[historyId] === undefined) {
            throw new Error(`No history with given id '${historyId}' exists.`);
        }
        this.histories[historyId].perform(action);
        this.touchedHistories[historyId] = this.histories[historyId];
    }
}