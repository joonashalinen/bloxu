import IDirectionEmitter from "./IDirectionEmitter";
import IKeyEmitter from "./IKeyEmitter";
import IPointerEmitter from "./IPointerEmitter";

export default interface IInputEmitter {
    keyEmitters: IKeyEmitter[];
    directionEmitters: IDirectionEmitter[];
    pointerEmitters: IPointerEmitter[];
}