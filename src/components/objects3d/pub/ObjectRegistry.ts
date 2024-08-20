import { TObjectConstructor } from "../../../services/world3d/conf/objectConstructors";
import HistoryCollection from "../../data_structures/pub/HistoryCollection";
import Object from "./Object";

/**
 * An instance of this class is meant to be 
 * the single source of truth for all existing Objects 
 * and their corresponding owners and mesh ids.
 */
export default class ObjectRegistry {
    objectConstructors: {[typeName: string]: TObjectConstructor} = {};
    history: HistoryCollection<Object> = new HistoryCollection();
    private _objectsById: {[name: string]: Object} = {};
    private _objectsByMeshId: {[name: string]: Object} = {};

    constructor() {
        
    }

    /**
     * Adds an object into the registry 
     * so that it can be retrieved with either the 
     * id of the root mesh or the object id.
     */
    addObject(id: string, object: Object) {
        const meshId = object.transformNode.id;
        if (this.hasObjectWithMeshId(meshId)) {
            throw new Error(`Object with mesh id '${meshId}' 
                already exists in ObjectRegistry`);
        }
        if (this.hasObject(id)) {
            throw new Error(`Object with id '${id}' 
                already exists in ObjectRegistry`);
        }
        
        this._objectsByMeshId[meshId] = object;
        this._objectsById[id] = object;
        this.history.setHistory(id, object.history);
    }

    /**
     * Retrieves the object that has 
     * the given id or undefined if such 
     * does not exist.
     */
    getObject(id: string) {
        return this._objectsById[id];
    }

    /**
     * Retrieves the object that has a mesh 
     * with the given id or undefined if such 
     * does not exist.
     */
    getObjectWithMeshId(meshId: string) {
        return this._objectsByMeshId[meshId];
    }

    /**
     * Whether an object with the 
     * given id exists in the registry.
     */
    hasObject(id: string) {
        return this.getObject(id) !== undefined;
    }

    /**
     * Whether an object with the 
     * given mesh id exists in the registry.
     */
    hasObjectWithMeshId(meshId: string) {
        return this.getObjectWithMeshId(meshId) !== undefined;
    }

    /**
     * Creates a new object of the given type if 
     * such type has a set constructor.
     */
    createObject(id: string, type: string, args: Array<unknown>) {
        const objectConstructor = this.objectConstructors[type];
        if (objectConstructor === undefined) {
            throw new Error(`No object constructor for type 
                '${type}' set in ObjectRegistry.`);
        }
        const object = objectConstructor(id, ...args);
        object.id = id;
        this.addObject(id, object);
        return object;
    }

    /**
     * Call .doOnTick() for all objects.
     */
    doOnTick(passedTime: number, absoluteTime: number) {
        for (let id in this._objectsById) {
            let obj = this._objectsById[id];
            obj.doOnTick(passedTime, absoluteTime);
        }
    }
}