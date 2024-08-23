import Action from "../../../computation/pub/Action";
import Object from "../Object";
import IPicker from "./IPicker";
import ISelector, { DSelectInfo } from "./ISelector";
import Item from "./Item";

/**
 * An item that can pick up objects, which removes them from the world,
 * enabling for example replacing them somewhere else.
 */
export default class Picker extends Item implements IPicker {
    heldObjects: Object[] = [];
    maxHeldObjects: number = 1;
    canPick: () => boolean = () => { return this.heldObjects.length < this.maxHeldObjects; };
    canPickObject: (object: Object) => boolean = (object) => true;

    public get transformNode() {return this.selector.transformNode};
    public get menu() {return this.selector.menu};

    public get aimedDirection() {return this.selector.aimedDirection};
    public set aimedDirection(aimedDirection) {this.selector.aimedDirection = aimedDirection;};

    constructor(public selector: ISelector) {
        super();
        this.selector.onSelect((info) => {
            if (!this.isActive) return;
            if (info.object !== undefined) {
                if (this.canPick() && this.canPickObject(info.object)) {
                    this.history.perform(new Action(info.object,
                        (object) => {
                            object.teleportToVoid();
                            this.heldObjects.push(info.object);
                        },
                        (object) => {
                            object.bringBackFromTheVoid();
                            this.heldObjects.pop();
                        }
                    ));
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
        this.history.undo();
    }

    /**
     * Repicks the last unpicked object.
     */
    redo() {
        this.history.redo();
    }
}