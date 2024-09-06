import Action from "../../../computation/pub/Action";
import Object from "../Object";
import IItem from "./IItem";
import IPicker from "./IPicker";
import ISelector, { DSelectInfo } from "./ISelector";
import Item from "./Item";
import Selector from "./Selector";

/**
 * An item that can pick up objects, which removes them from the world,
 * enabling for example replacing them somewhere else.
 */
export default class Picker extends Item<Object, Picker> implements IPicker {
    heldObjects: Object[] = [];
    maxHeldObjects: number = 1;
    waitForBringBackFromVoidToFinish: boolean = true;
    canPick: () => boolean = () => { return this.heldObjects.length < this.maxHeldObjects; };
    canPickObject: (object: Object) => boolean = (object) => true;
    paintPickedObject: (object: Object) => void = (object) => {};

    public get transformNode() {return this.selector.transformNode};
    public get menu() {return this.selector.menu};

    public get aimedDirection() {return this.selector.aimedDirection};
    public set aimedDirection(aimedDirection) {this.selector.aimedDirection = aimedDirection;};

    constructor(public selector: Selector) {
        super();
        this.selector.onSelect((info) => {
            if (!this.isActive) return;
            if (info.object !== undefined && !info.object.isLocked) {
                if (this.canPick() && this.canPickObject(info.object)) {
                    this.history.perform(this.createPickAction(info.object));
                    this.emitter.trigger("pick", [info]);
                }
            }
        });
        this.selector.onItemUseEnded(() => {
            this.emitter.trigger("useEnd");
        });
    }

    activate(): void {
        super.activate();
        this.selector.activate();
    }

    deactivate(): void {
        super.deactivate();
        this.selector.deactivate();
    }

    doMainAction() {
        this.selector.doMainAction();
    }

    doSecondaryAction() {
        this.selector.doSecondaryAction();
    }

    doOnTick(passedTime: number, absoluteTime: number) {
        this.selector.doOnTick(passedTime, absoluteTime);
    }

    /**
     * Listen to 'pick' events for when an object 
     * has been picked.
     */
    onPick(callback: (info: DSelectInfo) => void) {
        this.emitter.on("pick", callback);
    }

    /**
     * Stop listening to 'pick' events.
     */
    offPick(callback: (info: DSelectInfo) => void) {
        this.emitter.off("pick", callback);
    }

    /**
     * Unpicks the last picked object.
     */
    undo() {
        const lastUndoable = this.history.undoableActions[this.history.undoableActions.length - 1];
        if (lastUndoable === undefined) return;
        if (this.waitForBringBackFromVoidToFinish &&
            lastUndoable.target.bringingBackFromTheVoid) return;
        this.history.undo();
        this.emitter.trigger("undo");
    }

    /**
     * Repicks the last unpicked object.
     */
    redo() {
        const lastRedoable = this.history.redoableActions[this.history.redoableActions.length - 1];
        if (lastRedoable === undefined) return;
        if (this.waitForBringBackFromVoidToFinish &&
            lastRedoable.target.bringingBackFromTheVoid) return;
        this.history.redo();
        this.emitter.trigger("redo");
    }

    /**
     * Creates an Action object that is performed when
     * the Picker picks an object.
     */
    createPickAction(object: Object) {
        return new Action(object, this,
            (object, context) => {
                context.paintPickedObject(object);
                object.teleportToVoid();
                context.heldObjects.push(object);
            },
            (object, context) => {
                object.bringBackFromTheVoid();
                context.heldObjects.pop();
            }
        );
    }

    /**
     * Destroys the Picker and the owned Selector
     */
    destroy() {
        super.destroy();
        this.selector.destroy();
    }
}