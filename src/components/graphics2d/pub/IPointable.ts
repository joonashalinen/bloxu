
/**
 * A graphical object that can be pointed at with a pointer 
 * controller (such as a mouse pointer for example).
 */
export interface IPointable {
    /**
     * Hover the pointer at the given screen coordinates
     */
    point(pointerPosition: {x: number, y: number}): IPointable;
    /**
     * Trigger the given pointer button at the given screen coordinates.
     */
    // triggerPointer(pointerPosition: {x: number, y:number}, buttonIndex: number): IPointable;
}