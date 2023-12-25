
export default interface IObject {
    /**
     * Does whatever the object wants to in order
     * to update itself in the world for the current tick.
     * The update's magnitude should be based solely on the given time 
     * instead of on the fact that the method was called. 
     * The purpose of this restriction is that objects in the 3D world 
     * will not behave differently when the frame rate changes.
     */
    doOnTick(time: number): IObject;
}