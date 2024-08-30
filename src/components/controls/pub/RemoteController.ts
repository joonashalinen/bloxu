import DVector2 from "../../graphics3d/pub/DVector2";
import IController, { DStateUpdate, TProperties } from "./IController";

export interface DRemoteStateUpdate<T> {
    expect: DStateUpdate<T>;
    set: DStateUpdate<T>;
}

export interface DStateConflict<T> {
    expected: T;
    encountered: T;
}

export interface DRemoteControlResult<T> {
    conflictsOccurred: boolean;
    conflicts: DStateUpdate<DStateConflict<T>>;
}

/**
 * A controller for a target that attempts to mimic 
 * the state of an equivalent target on a different
 * host. Provides state synchronization and conflict
 * detection features.
 */
export default class RemoteController {
    expectStateProperties: DStateUpdate<TProperties> = {before: {}, after: {}};
    setStateProperties: DStateUpdate<TProperties> = {before: {}, after: {}};

    constructor(public controller: IController) {
        
    }

    point(pointerPosition: DVector2, pointerIndex: number,
        stateUpdate: DStateUpdate<unknown>) {
        return this._doWithReferenceState("point", stateUpdate, () => {
            this.controller.point(pointerPosition, pointerIndex);
        });
    }

    triggerPointer(buttonIndex: number, pointerIndex: number,
        stateUpdate: DStateUpdate<unknown>) {
        return this._doWithReferenceState("triggerPointer", stateUpdate, () => {
            this.controller.triggerPointer(buttonIndex, pointerIndex);
        });
    }

    changeDirection(direction: DVector2, directionControllerIndex: number,
        stateUpdate: DStateUpdate<unknown>) {
        return this._doWithReferenceState("changeDirection", stateUpdate, () => {
            this.controller.changeDirection(direction, directionControllerIndex);
        });
    }

    pressKey(key: string, keyControllerIndex: number,
        stateUpdate: DStateUpdate<unknown>) {
        return this._doWithReferenceState("pressKey", stateUpdate, () => {
            this.controller.pressKey(key, keyControllerIndex);
        });
    }

    releaseKey(key: string, keyControllerIndex: number,
        stateUpdate: DStateUpdate<unknown>) {
        return this._doWithReferenceState("releaseKey", stateUpdate, () => {
            this.controller.releaseKey(key, keyControllerIndex);
        });
    }

    /**
     * Creates a new DRemoteStateUpdate from the given DStateUpdate
     * based on the policies set in .expectStateProperties and .setStateProperties
     * of the RemoteController.
     */
    stateUpdateToRemoteStateUpdate(method: string, stateUpdate: DStateUpdate<unknown>) {
        const remoteStateUpdate: DRemoteStateUpdate<unknown> = {
            expect: {before: {}, after: {}},
            set: {before: {}, after: {}}
        };
        this._populateRemoteStateUpdate(remoteStateUpdate, stateUpdate, method, "expect", "before");
        this._populateRemoteStateUpdate(remoteStateUpdate, stateUpdate, method, "expect", "after");
        this._populateRemoteStateUpdate(remoteStateUpdate, stateUpdate, method, "set", "before");
        this._populateRemoteStateUpdate(remoteStateUpdate, stateUpdate, method, "set", "after");
        return remoteStateUpdate;
    }

    /**
     * Populates the given DRemoteStateUpdate with the appropriate 
     * values from the given DStateUpdate based on the set .before or .after policies in
     * .expectStateProperties or .setStateProperties for the input method with 
     * the given name.
     */
    private _populateRemoteStateUpdate(remoteStateUpdate: DRemoteStateUpdate<unknown>,
        stateUpdate: DStateUpdate<unknown>, method: string, expectOrSet: "expect" | "set",
        beforeOrAfter: "before" | "after", ) {
        if (this[`${expectOrSet}StateProperties`] !== undefined) {
            const properties = this[`${expectOrSet}StateProperties`][beforeOrAfter][method];
            if (properties !== undefined) {
                properties.forEach((property) => {
                    remoteStateUpdate[expectOrSet][beforeOrAfter][property] = 
                        stateUpdate[beforeOrAfter][property];
                });
            }
        }
    }

    /**
     * Performs the given function but with state synchronization
     * and conflict detection.
     */
    protected _doWithReferenceState(methodName: string,
        stateUpdate: DStateUpdate<unknown>, f: () => void):
        DRemoteControlResult<unknown> {
        const referenceState = this.stateUpdateToRemoteStateUpdate(methodName, stateUpdate);
        this.controller.targetState.inject(referenceState.set.before);
        f();
        this.controller.targetState.inject(referenceState.set.after);
        return {
            conflictsOccurred: false,
            conflicts: {
                before: {expected: {}, encountered: {}},
                after: {expected: {}, encountered: {}}
            }
        };
    }
}