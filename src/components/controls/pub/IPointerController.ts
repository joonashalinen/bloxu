import IEventable from "../../events/pub/IEventable";
import DVector2 from "../../graphics3d/pub/DVector2";

export default interface IPointerController extends IEventable {
    /**
     * When the pointer has started pointing at a new coordinate.
     */
    onPoint(callback: (position: DVector2) => void): IPointerController;

    /**
     * When the pointer is triggered.
     */
    onTrigger(callback: (position: DVector2, buttonIndex: number) => void): IPointerController;
}