import EventEmitter from "../../../components/events/pub/EventEmitter";
import Movable from "../../../components/objects3d/pub/Movable";
import * as babylonjs from "@babylonjs/core";

/**
 * Class containing the state and operations of the world3d service.
 */
export default class World3D {
    objects: {[name: string]: Object};
    constructors: {[type: string]: Function};
    emitter: EventEmitter;
    babylonjs: typeof babylonjs;
    scene: babylonjs.Scene;

    constructor(scene: babylonjs.Scene) {
        this.emitter = new EventEmitter();
        this.constructors = {
            "Movable": (aggregate: babylonjs.PhysicsAggregate) => new Movable(aggregate)
        };
        this.objects = {};
        this.babylonjs = babylonjs;
        this.scene = scene;
    }

    /**
     * Get an object in the world with given id if it exists.
     */
    getObject(id: string) {
        if (!(id in this.objects)) {
            throw new Error("Object with given id '" + id + "' does not exist");
        }
        return this.objects[id];
    }

    /**
     * Create new object of given type with given id and args in the world.
     */
    createObject(id: string, type: string, args: Array<unknown> | Function = []): World3D {
        if (!(type in this.constructors)) {
            throw new Error("No object of type '" + type + "' exists");
        }
        if (id in this.objects) {
            throw new Error("Object with given id '" + id + "' already exists");
        }
        if (typeof args === "function") {
            args = args.bind(this)();
        }
        try {
            this.objects[id] = (this.constructors[type])(...args as Array<unknown>);
        } catch (e) {
            throw e;
        }
        return this;
    }

    /**
     * Create an object into the world via a given constructor function.
     */
    createCustomObject(id: string, create: () => unknown): void {
        if (id in this.objects) {
            throw new Error("Object with given id '" + id + "' already exists");
        }
        this.objects[id] = create.bind(this)();
    }

    /**
     * Modify an object in the world via a given function.
     */
    modifyObject(id: string, modifier: (obj) => unknown): World3D {
        var obj = this.getObject(id);
        this.objects[id] = modifier.bind(this)(obj);
        return this;
    }

}