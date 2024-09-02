import Action from "../../../computation/pub/Action";
import IState, { TProperty } from "../../../controls/pub/IState";
import IItem from "../items/IItem";

export interface DItemState {
    undoableHistory?: unknown[];
    redoableHistory?: unknown[];
    newUndoRedos?: ("undo" | "redo")[];
}

/**
 * Base class for IState implementations that are IItems.
 */
export default class ItemState implements IState<DItemState> {
    newUndoRedos: ("undo" | "redo")[] = [];
    createDataAction: (target: unknown) => unknown;
    getHistoryTargetFromId: (targetId: string) => unknown;
    createActionFromHistoryTarget: (target: unknown) => Action<unknown, unknown>;

    constructor(public target: IItem<unknown, unknown>) {
        target.onUndo(() => {this.newUndoRedos.push("undo");});
        target.onRedo(() => {this.newUndoRedos.push("redo");});
    }

    extract(properties: TProperty[]): DItemState {
        const data: DItemState = {};
        properties.forEach((property) => {
            if (property === "undoableHistory") {
                data.undoableHistory = this.target.history.undoableActions.map(
                    this.createDataAction);
            } else if (property === "redoableHistory") {
                data.redoableHistory = this.target.history.redoableActions.map(
                    this.createDataAction);
            } else if (property === "newUndoRedos") {
                data.newUndoRedos = this.newUndoRedos;
                this.newUndoRedos = [];
            }
        });
        return data;
    }

    inject(data: DItemState): void {
        Object.keys(data).forEach((property) => {
            if (property === "undoableHistory") {
                this._injectHistory("undo", data);
            } else if (property === "redoableHistory") {
                this._injectHistory("redo", data);
            } else if (property === "newUndoRedos") {
                data.newUndoRedos.forEach((undoRedo) => {
                    if (undoRedo === "undo") {
                        this.target.undo();
                    } else {
                        this.target.redo();
                    }
                })
            }
        });
    }

    /**
     * Sets the undo or redo history of the target from the given DItemState, 
     * which is assumed to have the specified history.
     */
    private _injectHistory(type: "undo" | "redo", data: DItemState) {
        const historyTargets = data[`${type}ableHistory`].map(this.getHistoryTargetFromId);
        
        this.target.history[`${type}ableActions`] = historyTargets.map(
            this.createActionFromHistoryTarget);
    }
}