var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import EventEmitter from "../../../components/events/pub/EventEmitter";
import Movable from "../../../components/objects3d/pub/Movable";
import * as babylonjs from "@babylonjs/core";
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { HavokPlugin } from "@babylonjs/core/Physics";
import HavokPhysics from "@babylonjs/havok";
import { Engine, Scene, Vector3, HemisphericLight } from "@babylonjs/core";
/**
 * Class containing the state and operations of the world3d service.
 */
export default class World3D {
    constructor(document) {
        this.constructors = {
            "Movable": (aggregate) => new Movable(aggregate)
        };
        this.emitter = new EventEmitter();
        this.objects = {};
        this.babylonjs = babylonjs;
        this.canvas = document.createElement("canvas");
        this.canvas.style.width = "90%";
        this.canvas.style.height = "90%";
        this.canvas.id = "gameCanvas";
        document.body.appendChild(this.canvas);
        this.engine = new Engine(this.canvas, true);
        this.scene = new Scene(this.engine);
    }
    /**
     * Get an object in the world with given id if it exists.
     */
    getObject(id) {
        if (!(id in this.objects)) {
            throw new Error("Object with given id '" + id + "' does not exist");
        }
        return this.objects[id];
    }
    /**
     * Create new object of given type with given id and args in the world.
     */
    createObject(id, type, args = []) {
        if (!(type in this.constructors)) {
            throw new Error("No object of type '" + type + "' exists");
        }
        if (id in this.objects) {
            throw new Error("Object with given id '" + id + "' already exists");
        }
        if (!Array.isArray(args)) {
            const { boundArgs, f: getArgs } = args;
            args = getArgs.bind(this)(...boundArgs);
        }
        try {
            this.objects[id] = (this.constructors[type])(...args);
        }
        catch (e) {
            throw e;
        }
        return this;
    }
    /**
     * Register a custom constructor for a new object type.
     * @param type - The type name for the object.
     * @param wrapper - The object containing boundArgs and the constructor function for creating objects of the specified type.
     */
    registerObjectType(type, wrapper) {
        const { boundArgs, f: constructor } = wrapper;
        if (type in this.constructors) {
            throw new Error("Constructor for type '" + type + "' already exists");
        }
        this.constructors[type] = constructor.bind(this, ...boundArgs);
        return this;
    }
    /**
     * Create an object into the world via a given constructor function.
     * @param id - The identifier for the object.
     * @param wrapper - The object containing boundArgs and the create function.
     */
    createCustomObject(id, wrapper) {
        const { boundArgs, f: create } = wrapper;
        if (id in this.objects) {
            throw new Error("Object with given id '" + id + "' already exists");
        }
        this.objects[id] = create.bind(this)(...boundArgs);
    }
    /**
     * Modify an object in the world via a given function.
     * @param id - The identifier for the object.
     * @param wrapper - The object containing boundArgs and the modifier function.
     */
    modifyObject(id, wrapper) {
        const { boundArgs, f: modifier } = wrapper;
        var obj = this.getObject(id);
        this.objects[id] = modifier.bind(this, ...boundArgs)(obj);
        return this;
    }
    /**
     * Initialization procedure for the World3D service.
     */
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            // ### Initialize BabylonJS. ###
            var camera = new babylonjs.FreeCamera("camera1", new babylonjs.Vector3(0, 3, -10), this.scene);
            camera.attachControl(this.canvas, true);
            var light1 = new HemisphericLight("light1", new Vector3(1, 1, 0), this.scene);
            // var sphere: Mesh = MeshBuilder.CreateSphere("sphere", { diameter: 1 }, this.scene);
            // hide/show the Inspector
            window.addEventListener("keydown", (ev) => {
                // Shift+Ctrl+Alt+I
                if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.key === 'i') {
                    if (this.scene.debugLayer.isVisible()) {
                        this.scene.debugLayer.hide();
                    }
                    else {
                        this.scene.debugLayer.show();
                    }
                }
            });
            // Enable physics.
            const havokInstance = yield HavokPhysics();
            this.scene.enablePhysics(new Vector3(0, -9.81, 0), new HavokPlugin(true, havokInstance));
            // ### Begin main render loop. ###
            this.engine.runRenderLoop(() => {
                for (let id in this.objects) {
                    let obj = this.objects[id];
                    if ("doOnTick" in obj) {
                        obj.doOnTick(0);
                    }
                }
                this.scene.render();
            });
            return this;
        });
    }
}
//# sourceMappingURL=World3D.js.map