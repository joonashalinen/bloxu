import IEventable from "../../events/pub/IEventable";

export default interface IKeyController extends IEventable {
    /**
     * When a key is pressed down.
     */
    onKeyDown(callback: (key: string) => void): void;
    
    /**
     * When a pressed down key is released.
     */
    onKeyUp(callback: (key: string) => void): void;
}