import Object from "../Object";
import IItem from "./IItem";
import { DSelectInfo } from "./ISelector";

export default interface IPicker extends IItem {
    heldObjects: Object[];
    maxHeldObjects: number;
    canPick: () => boolean;
    canPickObject: (object: Object) => boolean;
    onPick(callback: (info: DSelectInfo) => void): void;
    offPick(callback: (info: DSelectInfo) => void): void;
}