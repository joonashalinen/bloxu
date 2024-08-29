import IEventable from "../../events/pub/IEventable";

export default interface IKeyController extends IEventable {
    /**
     * When a key is pressed down.
     */
    onPressKey(callback: (key: string) => void): void;
    
    /**
     * When a pressed down key is released.
     */
    onReleaseKey(callback: (key: string) => void): void;
}