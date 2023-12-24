import EventEmitter from "../../../components/events/pub/EventEmitter";
import Movable from "../../../components/objects3d/pub/Movable";

/**
 * Class containing the state and operations of the world3d service.
 */
export default class World3D {
    objects: {[name: string]: Object};
    constructors: {[type: string]: Function};
    emitter: EventEmitter;

    /**
     * Get an object with given id if it exists.
     */
    _getObject(id: string) {
        if (!(id in this.objects)) {
            throw new Error("Object with given id '" + id + "' does not exist");
        }
        return this.objects[id];
    }

    constructor() {
        this.emitter = new EventEmitter();
        this.constructors = {
            "Movable": (args: Array<unknown>) => new Movable()
        };
        this.objects = {};
    }

    /**
     * Create new object of given type with given id and args in the world.
     */
    createObject(id: string, type: string, args: Array<unknown> = []): World3D {
        if (!(type in this.constructors)) {
            throw new Error("No object of type '" + type + "' exists");
        }
        if (id in this.objects) {
            throw new Error("Object with given id '" + id + "' already exists");
        }
        try {
            this.objects[id] = (this.constructors[type])(args);
        } catch (e) {
            throw e;
        }
        return this;
    }

    /**
     * Modify an object in the world via a given function.
     */
    modifyObject(id: string, modifier: (unknown) => unknown): void {
        var obj = this._getObject(id);
        this.objects[id] = modifier(obj);
    }

}