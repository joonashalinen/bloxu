import EventEmitter from "../../../components/events/pub/EventEmitter";
import Movable from "../../../components/objects3d/pub/Movable";
import * as babylonjs from "@babylonjs/core";
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { HavokPlugin } from "@babylonjs/core/Physics";
import HavokPhysics from "@babylonjs/havok";
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, Mesh, MeshBuilder } from "@babylonjs/core";

/**
 * Class containing the state and operations of the world3d service.
 */
export default class World3D {
    objects: {[name: string]: Object};
    constructors: {[type: string]: Function};
    emitter: EventEmitter;
    babylonjs: typeof babylonjs;
    scene: babylonjs.Scene;
    engine: babylonjs.Engine;
    canvas: HTMLCanvasElement;

    constructor(document: Document) {
        this.constructors = {
            "Movable": (aggregate: babylonjs.PhysicsAggregate) => new Movable(aggregate)
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
     * Register a custom constructor for a new object type.
     * @param type - The type name for the object.
     * @param constructor - The constructor function for creating objects of the specified type.
     */
    registerObjectType(type: string, constructor: Function): World3D {
        if (type in this.constructors) {
            throw new Error("Constructor for type '" + type + "' already exists");
        }
        this.constructors[type] = constructor.bind(this);
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

    /**
     * Initialization procedure for the World3D service.
     */
    async initialize(): Promise<World3D> {
        
        // ### Initialize BabylonJS. ###

        var camera = new babylonjs.FreeCamera("camera1", new babylonjs.Vector3(0, 3, -10), this.scene);
        camera.attachControl(this.canvas, true);
        var light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), this.scene);
        // var sphere: Mesh = MeshBuilder.CreateSphere("sphere", { diameter: 1 }, this.scene);

        // hide/show the Inspector
        window.addEventListener("keydown", (ev) => {
            // Shift+Ctrl+Alt+I
            if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.key === 'i') {
                if (this.scene.debugLayer.isVisible()) {
                    this.scene.debugLayer.hide();
                } else {
                    this.scene.debugLayer.show();
                }
            }
        });

        // Enable physics.
        const havokInstance = await HavokPhysics();
        this.scene.enablePhysics(
            new Vector3(0, -9.81, 0),
            new HavokPlugin(true, havokInstance)
        );

        // ### Begin main render loop. ###

        this.engine.runRenderLoop(() => {
            this.emitter.trigger("message", [{
                recipient: "player1",
                message: {
                    type: "event",
                    message: {
                        type: "keyPress",
                        args: [{direction: "up"}]
                    }
                }
            }]);
            this.scene.render();
        });

        return this;
    }
}