import IInputEmitter from "../../../components/controls/pub/IInputEmitter";
import KeyboardEmitter from "../../../components/controls/pub/KeyboardEmitter";
import MouseEmitter from "../../../components/controls/pub/MouseEmitter";

export default function createInputEmitters(
    document: Document, canvas: HTMLCanvasElement): IInputEmitter[] {
    const keyboardEmitter = new KeyboardEmitter(document);
    return [{
        keyEmitters: [keyboardEmitter],
        directionEmitters: [keyboardEmitter],
        pointerEmitters: [new MouseEmitter(canvas)]
    }];
}