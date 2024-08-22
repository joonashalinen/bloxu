import { AnimationGroup, TransformNode, Vector3 } from "@babylonjs/core";
import EventEmitter from "../../../events/pub/EventEmitter";
import IItem from "./IItem";
import IMenu from "../menus/IMenu";

/**
 * Base class for IItem implementations.
 */
export default class Item implements IItem {
    ownerId: string;
    hasSecondaryAction: boolean = false;
    emitter: EventEmitter = new EventEmitter();
    useDelay: number = 0;
    protected _menu: IMenu;
    protected _itemUsed = false;
    protected _animationEnded = false;
    protected _aimedDirection: Vector3 = new Vector3(1, 0, 0);
    private _transformNode: TransformNode;

    constructor(public useAnimation: AnimationGroup = undefined) {
    }

    public get transformNode() {
        return this._transformNode;
    }

    public set transformNode(transformNode) {
        this._transformNode = transformNode;
    }

    public get menu() {
        return this._menu;
    }

    public set menu(menu) {
        this._menu = menu;
    }

    public get aimedDirection() {
        return this._aimedDirection;
    }

    public set aimedDirection(aimedDirection: Vector3) {
        this._aimedDirection = aimedDirection;
    }

    onItemUseEnded(callback: () => void): void {
        this.emitter.on("useEnd", callback);
    }

    offItemUseEnded(callback: () => void): void {
        this.emitter.off("useEnd", callback);
    }

    doMainAction(): void {
        this._itemUsed = false;
        this._animationEnded = false;
        if (this.useAnimation !== undefined) {
            this.useAnimation.onAnimationGroupEndObservable.addOnce(() => {
                this._animationEnded = true;
                if (this._itemUsed) this.emitter.trigger("useEnd");
            });
            this.useAnimation.play();
            if (this.useDelay === 0) {
                this._doMainActionWithoutAnimation();
            } else {
                setTimeout(() => {
                    this._doMainActionWithoutAnimation();
                }, this.useDelay);
            }
        }
    }

    doSecondaryAction(): void {
    }

    doOnTick(passedTime: number, absoluteTime: number) {
        
    }

    protected _doMainActionWithoutAnimation() {
        this._itemUsed = true;
        if (this._animationEnded) this.emitter.trigger("useEnd");
    }
}