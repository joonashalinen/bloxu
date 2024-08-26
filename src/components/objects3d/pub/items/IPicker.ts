import Object from "../Object";
import IItem from "./IItem";
import { DSelectInfo } from "./ISelector";

export default interface IPicker {
    heldObjects: Object[];
    maxHeldObjects: number;
    canPick: () => boolean;
    canPickObject: (object: Object) => boolean;
    paintPickedObject: (object: Object) => void;
    onPick(callback: (info: DSelectInfo) => void): void;
    offPick(callback: (info: DSelectInfo) => void): void;
}