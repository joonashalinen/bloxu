import EventEmitter from "../../../components/events/pub/EventEmitter";
import Movable from "../../../components/objects3d/pub/Movable";
import * as babylonjs from "@babylonjs/core";
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { HavokPlugin } from "@babylonjs/core/Physics";
import HavokPhysics from "@babylonjs/havok";
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, Mesh, MeshBuilder } from "@babylonjs/core";
import IObject from "../../../components/objects3d/pub/IObject";
import ProxyMessenger from "../../../components/messaging/pub/ProxyMessenger";
import { DMessage } from "../../../components/messaging/pub/DMessage";

type FunctionWrapper = {
    boundArgs: Array<unknown>;
    f: Function;
};

/**
 * Class containing the state and operations of the world3d service.
 */
export default class World3D {
    objects: {[name: string]: Object};
    constructors: {[type: string]: Function};
    proxyMessenger: ProxyMessenger<DMessage, DMessage>;
    babylonjs: typeof babylonjs;
    scene: babylonjs.Scene;
    engine: babylonjs.Engine;
    canvas: HTMLCanvasElement;

    constructor(document: Document) {
        this.constructors = {
            "Movable": (aggregate: babylonjs.PhysicsAggregate) => new Movable(aggregate)
        };
        
        this.proxyMessenger = new ProxyMessenger<DMessage, DMessage>();
        this.objects = {};
        this.babylonjs = babylonjs;

        this.canvas = document.createElement("canvas");
        this.canvas.style.width = "90%";
        this.canvas.style.height = "90%";
        this.canvas.id = "gameCanvas";
        this.hide();
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
    createObject(id: string, type: string, args: Array<unknown> | FunctionWrapper = []): World3D {
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
            this.objects[id] = (this.constructors[type])(...args as Array<unknown>);
        } catch (e) {
            throw e;
        }
        return this;
    }

    /**
     * Register a custom constructor for a new object type.
     * @param type - The type name for the object.
     * @param wrapper - The object containing boundArgs and the constructor function for creating objects of the specified type.
     */
    registerObjectType(type: string, wrapper: FunctionWrapper): World3D {
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
    createCustomObject(id: string, wrapper: FunctionWrapper): void {
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
    modifyObject(id: string, wrapper: FunctionWrapper): World3D {
        const { boundArgs, f: modifier } = wrapper;
        var obj = this.getObject(id);
        this.objects[id] = modifier.bind(this, ...boundArgs)(obj);
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

        return this;
    }

    /**
     * Show the canvas.
     */
    show() {
        this.canvas.style.display = "block";
        this.engine.resize();
    }

    /**
     * Hide the canvas.
     */
    hide() {
        this.canvas.style.display = "none";
    }

    /**
     * Pause the render loop.
     */
    pauseRenderLoop() {
        this.engine.stopRenderLoop();
    }
    
    /**
     * Run the render loop.
     */
    runRenderLoop() {
        this.engine.runRenderLoop(() => {
            for (let id in this.objects) {
                let obj = this.objects[id];
                if ("doOnTick" in obj) {
                    (obj as IObject).doOnTick(0);
                }
            }
            this.scene.render();
        });
    }

    /**
     * Make the world visible and running.
     */
    run() {
        this.runRenderLoop();
        this.show();
    }

    /**
     * Pause the world and make it no longer visible.
     */
    pause() {
        this.pauseRenderLoop();
        this.hide();
    }
}