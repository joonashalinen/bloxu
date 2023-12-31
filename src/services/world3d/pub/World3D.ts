import Movable from "../../../components/objects3d/pub/Movable";
import * as babylonjs from "@babylonjs/core";
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders";
import { HavokPlugin } from "@babylonjs/core/Physics";
import HavokPhysics from "@babylonjs/havok";
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, Mesh, MeshBuilder } from "@babylonjs/core";
import IObject from "../../../components/objects3d/pub/IObject";
import ProxyMessenger from "../../../components/messaging/pub/ProxyMessenger";
import { DMessage } from "../../../components/messaging/pub/DMessage";
import IService from "../../../components/services/pub/IService";
import MessageFactory from "../../../components/messaging/pub/MessageFactory";
import SyncMessenger from "../../../components/messaging/pub/SyncMessenger";
import FunctionWrapper from "../../../components/services/pub/FunctionWrapper";
import MeshLeash2D from "../../../components/graphics3d/pub/MeshLeash2D";
import customObjectTypes from "../conf/customObjectTypes";
import Pointer from "../../../components/objects3d/pub/Pointer";
import meshConstructors from "../conf/meshConstructors";
import Glow from "../../../components/graphics3d/pub/effects/Glow";

type Types = {[type: string]: Function};
type Instances = {[name: string]: Object};

/**
 * Class containing the state and operations of the world3d service.
 */
export default class World3D implements IService {
    objects: Instances;
    objectTypes: Types;
    effects: Instances;
    effectTypes: Types;
    meshConstructors: {[name: string]: Function};
    proxyMessenger: ProxyMessenger<DMessage, DMessage>;
    syncMessenger: SyncMessenger;
    messageFactory: MessageFactory;
    babylonjs: typeof babylonjs;
    scene: babylonjs.Scene;
    engine: babylonjs.Engine;
    canvas: HTMLCanvasElement;
    camera: babylonjs.FollowCamera;

    constructor(document: Document) {
        this.objects = {};
        this.objectTypes = {
            "Movable": Movable,
            "MeshLeash2D": MeshLeash2D,
            "Pointer": Pointer,
            ...customObjectTypes
        };
        
        this.effects = {};
        this.effectTypes = {
            "Glow": Glow
        };

        this.meshConstructors = {};
        this.proxyMessenger = new ProxyMessenger<DMessage, DMessage>();
        this.syncMessenger = new SyncMessenger(this.proxyMessenger);
        this.messageFactory = new MessageFactory("world3d");
        this.babylonjs = babylonjs;

        this.canvas = document.createElement("canvas");
        this.canvas.style.width = "90%";
        this.canvas.style.height = "90%";
        this.canvas.style.cursor = "none";
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
     * Get an effect instance with given id if it exists.
     */
    getEffect(id: string) {
        if (!(id in this.effects)) {
            throw new Error("Effect with given id '" + id + "' does not exist");
        }
        return this.effects[id];
    }

    /**
     * Create new object of given type with given id and args in the world.
     */
    createObject(id: string, type: string, args: Array<unknown> | FunctionWrapper<Function> = []): World3D {
        if (id in this.objects) {
            throw new Error("Object with given id '" + id + "' already exists");
        }
        this.objects[id] =this._create(type, this.objectTypes, args);
        return this;
    }

    /**
     * Create new object of given type with given id and args in the world.
     */
    createEffect(id: string, type: string, args: Array<unknown> | FunctionWrapper<Function> = []): World3D {
        if (id in this.effects) {
            throw new Error("Effect with given id '" + id + "' already exists");
        }
        this.effects[id] =this._create(type, this.effectTypes, args);
        return this;
    }

    /**
     * Register a custom constructor for a new object type.
     * @param type - The type name for the object.
     * @param wrapper - The object containing boundArgs and the constructor function for creating objects of the specified type.
     */
    registerObjectType(type: string, wrapper: FunctionWrapper<Function>): World3D {
        const { boundArgs, f: constructor } = wrapper;
        if (type in this.objectTypes) {
            throw new Error("Constructor for type '" + type + "' already exists");
        }
        this.objectTypes[type] = constructor.bind(this, ...boundArgs);
        return this;
    }

    /**
     * Create an object into the world via a given constructor function.
     * @param id - The identifier for the object.
     * @param wrapper - The object containing boundArgs and the create function.
     */
    createCustomObject(id: string, wrapper: FunctionWrapper<Function>): void {
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
    modifyObject(id: string, wrapper: FunctionWrapper<Function>): World3D {
        const { boundArgs, f: modifier } = wrapper;
        var obj = this.getObject(id);
        this.objects[id] = modifier.bind(this, ...boundArgs)(obj);
        return this;
    }

    /**
     * Initialization procedure for the World3D service.
     */
    async initialize(): Promise<boolean> {
        
        // ### Initialize BabylonJS. ###

        this.camera = new babylonjs.FollowCamera("camera1", new babylonjs.Vector3(0, 5, -10), this.scene);
        this.camera.attachControl(true);
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

        // Load meshes configured by the project where World3D is being used.
        this.meshConstructors = await meshConstructors(this.babylonjs, this.scene);

        // Communicate to the outside world about events.
        this.scene.onPointerObservable.add((pointerInfo) => {
            // Mouse down event.
            if (pointerInfo.type === this.babylonjs.PointerEventTypes.POINTERDOWN) {
                this.proxyMessenger.postMessage(
                    this.messageFactory.createEvent("*", "World3D:<event>mouseDown", [{
                        x: pointerInfo.event.clientX,
                        y: pointerInfo.event.clientY
                    }])
                )
            }
        });

        return true;
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

    /**
     * Create a new instance of given type name 
     * from the list of class constructors 'types'.
     */
    private _create(
        type: string, 
        types: Types, 
        args: Array<unknown> | FunctionWrapper<Function>
    ) {
        if (!(type in types)) {
            throw new Error("No type '" + type + "' exists");
        }
        if (!Array.isArray(args)) {
            const { boundArgs, f: getArgs } = args;
            args = getArgs.bind(this)(...boundArgs);
        }
        const obj = new (types[type] as typeof Object)(...args as Array<unknown>) ;
        return obj;
    }
}