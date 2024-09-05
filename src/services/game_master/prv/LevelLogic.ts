import EventEmitter from "../../../components/events/pub/EventEmitter";

/**
 * Contains the game's logic relating to
 * level states, such as when the level has ended.
 * LevelLogic does not implement any of this logic 
 * but is intended for the client to configure.
 */
export default class LevelLogic {
    emitter: EventEmitter = new EventEmitter();
    handleStartLevel: () => void | Promise<void> = () => {};
    handleEndLevel: () => void | Promise<void> = () => {};
    handleEvent: (type: string, args: unknown[]) => void | Promise<void> = () => {};
    currentLevelIndex: number = 6;
    levels: string[] = [];

    constructor() {
        
    }

    /**
     * Sets an event listener for the 'endLevel' event,
     * which is triggered when LevelLogic concludes
     * that the level has ended.
     */
    onEndLevel(callback: (nextLevelId: string | undefined) => void) {
        this.emitter.on("endLevel", callback);
    }

    offEndLevel(callback: (nextLevelId: string | undefined) => void) {
        this.emitter.off("endLevel", callback);
    }
}