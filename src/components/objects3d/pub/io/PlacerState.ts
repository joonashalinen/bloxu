import Action from "../../../computation/pub/Action";
import IState, { TProperty } from "../../../controls/pub/IState";
import DVector3 from "../../../graphics3d/pub/DVector3";
import Vector3Utils from "../../../graphics3d/pub/Vector3Utils";
import Placer, { DActionContext } from "../items/Placer";
import Object3D from "../Object";
import ObjectManager from "../ObjectManager";
import ItemState, { DItemState } from "./ItemState";

export interface DPlacerActionState {
    objectWasInVoid: boolean;
    objectWasHeld: boolean;
    objectOriginalPosition: DVector3;
    selectionPosition: DVector3;
}

export interface DPlacerPlacementState {
    objectWasHeld: boolean;
    objectId: string;
    absolutePosition: DVector3;
}

export interface DPlacerState extends DItemState {
    selectionPosition?: DVector3;
    heldObjectIds?: string[];
    newPlacements?: DPlacerPlacementState[];
}

/**
 * Represents the state of a Placer.
 */
export default class PlacerState extends ItemState implements IState<DPlacerState> {
    newPlacements: DPlacerPlacementState[] = [];
    newUndoRedos: ("undo" | "redo")[] = [];

    constructor(public target: Placer, public objectManager: ObjectManager) {
        super(target);

        target.onPlace((info) => {
            this.newPlacements.push({
                objectId: info.object.id,
                absolutePosition: Vector3Utils.toObject(info.absolutePosition),
                objectWasHeld: info.objectWasHeld
            });
        });
        this.createDataAction = this._actionToPlacerActionState;
        this.getHistoryTargetFromId = this.objectManager.getObject.bind(this.objectManager);
        this.createActionFromHistoryTarget = this.target.createPlaceAction.bind(this.target);
    }

    extract(properties: TProperty[]): DPlacerState {
        const data: DPlacerState = super.extract(properties);
        properties.forEach((property) => {
            if (property === "selectionPosition") {
                data.selectionPosition = Vector3Utils.toObject(
                    this.target.selector.selectionPosition);
            } else if (property === "undoableHistory") {
                data.undoableHistory = this.target.history.undoableActions.map(
                    this._actionToPlacerActionState);
            } else if (property === "redoableHistory") {
                data.redoableHistory = this.target.history.redoableActions.map(
                    this._actionToPlacerActionState);
            } else if (property === "heldObjectIds") {
                data.heldObjectIds = this.target.heldObjects.map((object) => object.id);
            } else if (property === "newPlacements") {
                data.newPlacements = this.newPlacements;
                this.newPlacements = [];
            } else if (property === "newUndoRedos") {
                data.newUndoRedos = this.newUndoRedos;
                this.newUndoRedos = [];
            }
        });
        return data;
    }

    inject(data: DPlacerState): void {
        super.inject(data);
        Object.keys(data).forEach((property) => {
            if (property === "selectionPosition") {
                this.target.selector.selectionPosition = Vector3Utils.fromObject(
                    data.selectionPosition);
            } else if (property === "heldObjectIds") {
                this.target.heldObjects = data.heldObjectIds.map(
                    this.objectManager.getObject.bind(this.objectManager));

            } else if (property === "newPlacements") {
                data.newPlacements.forEach((placement) => {
                    this.target.selector.selectionPosition = Vector3Utils.fromObject(
                        placement.absolutePosition);
                    
                    const placementSuccessful = placement.objectWasHeld ? 
                        this.target.placeHeldObject() :
                        this.target.placeObject(this.objectManager.getObject(placement.objectId));
                    // If the Placer's .doMainAction is disabled, then
                    // the external user (us) is responsible for triggering
                    // 'useEnd'.
                    if (placementSuccessful && this.target.passiveModeEnabled) {
                        this.target.emitter.trigger("useEnd");
                    }
                });
            }
        });
    }

    /**
     * Transforms an Action of the Placer into a DPlacerActionState
     */
    private _actionToPlacerActionState(action: Action<Object3D, DActionContext>) {
        return {
            objectWasInVoid: action.context.objectWasInVoid,
            objectWasHeld: action.context.objectWasHeld,
            objectOriginalPosition: Vector3Utils.toObject(
                action.context.objectOriginalPosition),
            selectionPosition: Vector3Utils.toObject(action.context.selectionPosition)
        };
    }
}