import { AbstractMesh, Vector3 } from "@babylonjs/core";
import EventEmitter from "../../../events/pub/EventEmitter";
import IItem from "../items/IItem";
import Object from "../Object";

export type TMeshMapper = (mesh: AbstractMesh) => AbstractMesh

export interface DSelectInfo {
    object?: Object,
    gridCell?: Vector3
    absolutePosition: Vector3,
}

export default interface ISelector extends IItem {
    emitter: EventEmitter;
    previewMesh: AbstractMesh;
    selectionPosition: Vector3;
    preview: TMeshMapper;
    unpreview: TMeshMapper;
    // Listens to the 'select' event.
    onSelect(callback: (info: DSelectInfo) => void): void;
    onSelect(callback: (info: DSelectInfo) => void): void;
    deletePreviewMesh(): void;
}