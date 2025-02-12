import * as babylonjs from "@babylonjs/core";
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders";
import { HavokPlugin } from "@babylonjs/core/Physics";
import HavokPhysics from "@babylonjs/havok";
import { Engine, Scene, Vector3, HemisphericLight, Mesh } from "@babylonjs/core";
import ProxyMessenger from "../../../components/messaging/pub/ProxyMessenger";
import { DMessage } from "../../../components/messaging/pub/DMessage";
import IService from "../../../components/services/pub/IService";
import MessageFactory from "../../../components/messaging/pub/MessageFactory";
import SyncMessenger from "../../../components/messaging/pub/SyncMessenger";
import FunctionWrapper from "../../../components/services/pub/FunctionWrapper";
import meshConstructors, { TMeshConstructors } from "../conf/meshConstructors";
import objectConstructors from "../conf/objectConstructors";
import createControllerConstructors, { TControllerConstructors } from "../conf/controllerConstructors";
import Glow from "../../../components/graphics3d/pub/effects/Glow";
import maps, { TMapGenerator } from "../conf/maps/maps";
import ObjectManager from "../../../components/objects3d/pub/ObjectManager";
import createGlobals from "../conf/globals";
import createBackgrounds, { IBackgrounds } from "../conf/backgrounds";
import ILiveEnvironment from "../../../components/graphics3d/pub/ILiveEnvironment";
import IController, { DStateUpdate } from "../../../components/controls/pub/IController";
import RemoteController, { DRemoteControlResult} from "../../../components/controls/pub/RemoteController";
import createRemoteControllerConstructors from "../conf/remoteControllerConstructors";
import Object3D from "../../../components/objects3d/pub/Object";

type Types = {[type: string]: Function};
type Instances = {[name: string]: Object};
type RemoteControllerConstructors = {[id: string]: (...args: unknown[]) => RemoteController};

/**
 * Class containing the state and operations of the world3d service.
 */
export default class World3D implements IService {
    objects: ObjectManager;
    backgrounds: IBackgrounds;
    currentBackground: ILiveEnvironment;
    effects: Instances;
    effectTypes: Types;
    skybox: Mesh;
    meshConstructors: TMeshConstructors;
    proxyMessenger: ProxyMessenger<DMessage, DMessage>;
    syncMessenger: SyncMessenger;
    messageFactory: MessageFactory;
    babylonjs: typeof babylonjs;
    scene: babylonjs.Scene;
    engine: babylonjs.Engine;
    canvas: HTMLCanvasElement;
    camera: babylonjs.ArcRotateCamera;
    gravity: Vector3;
    glowLayer: babylonjs.GlowLayer;
    controllers: {[id: string]: IController};
    controllerConstructors: TControllerConstructors;
    remoteControllers: {[id: string]: RemoteController};
    remoteControllerConstructors: RemoteControllerConstructors;
    globals: {[name: string]: unknown};
    currentMapId: string;

    constructor(public id: string, document: Document) {
        this.objects = new ObjectManager();
        this.controllers = {};
        this.controllerConstructors = createControllerConstructors(this.objects);
        this.remoteControllers = {};
        this.remoteControllerConstructors = createRemoteControllerConstructors(
            this.controllerConstructors);
        this.globals = createGlobals();

        this.effects = {};
        this.effectTypes = {
            "Glow": Glow
        };

        this.meshConstructors = {};
        this.proxyMessenger = new ProxyMessenger<DMessage, DMessage>();
        this.syncMessenger = new SyncMessenger(this.proxyMessenger);
        this.messageFactory = new MessageFactory("world3d");
        this.babylonjs = babylonjs;

        // Setup canvas element.
        this.canvas = document.createElement("canvas");
        this.canvas.style.width = "100%";
        this.canvas.style.height = "100%";
        this.canvas.id = "gameCanvas";
        this.hide();
        const canvasWrapper = document.createElement("div");
        canvasWrapper.appendChild(this.canvas);
        canvasWrapper.style.cursor = "crosshair";
        canvasWrapper.style.width = "100%";
        canvasWrapper.style.height = "100%";
        document.body.appendChild(canvasWrapper);

        this.engine = new Engine(this.canvas, true, {
            deterministicLockstep: true,
            lockstepMaxSteps: 4,
        });
        this.scene = new Scene(this.engine);
        this.glowLayer = new babylonjs.GlowLayer("mainGlowLayer", this.scene);

        document.defaultView.addEventListener("resize", () => {
            this.engine.resize();
        });
    }

    /**
     * Get an object in the world with given id if it exists.
     */
    getObject(id: string) {
        if (!this.objects.hasObject(id)) {
            throw new Error("Object with given id '" + id + "' does not exist");
        }
        return this.objects.getObject(id);
    }

    /**
     * Get the IController for the Object 
     * with the given id.
     */
    getController(id: string) {
        if (!(id in this.controllers)) {
            throw new Error("IController with given id '" + id + "' does not exist");
        }
        return this.controllers[id];
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
    createObject(id: string, type: string, args: Array<unknown> | FunctionWrapper<Function> = []) {
        if (!Array.isArray(args)) {
            args = args.f.apply(this, args.boundArgs) as unknown[];
        }
        this.objects.createObject(id, type, args);
        return true;
    }

    /**
     * Create a new IController of the given type for the 
     * object with the given id.
     */
    createController(type: string, objectId: string): boolean {
        const controllerConstructor = this.controllerConstructors[type];
        if (controllerConstructor === undefined) {
            return false;
        }
        const obj = this.getObject(objectId);
        this.controllers[objectId] = controllerConstructor(obj);
        return true;
    }

    /**
     * Create a new RemoteController of the given type for the 
     * object with the given id.
     */
    createRemoteController(type: string, objectId: string): boolean {
        const controllerConstructor = this.remoteControllerConstructors[type];
        if (controllerConstructor === undefined) {
            return false;
        }
        const obj = this.getObject(objectId);
        this.remoteControllers[objectId] = controllerConstructor(obj);
        return true;
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
     * Redirect a control input to the IController of the 
     * object with the given objectId. The method specified by 
     * controllerMethod will be called with the given args.
     */
    control(objectId: string, controllerMethod: string, args: unknown[] = []) {
        const controller = this.controllers[objectId];
        if (controller === undefined ||
            typeof controller[controllerMethod]  !== "function") {
            return false;
        }
        const stateUpdate: DStateUpdate<Object3D> = controller[controllerMethod](...args);
        return stateUpdate;
    }

    /**
     * Redirect a control input to the RemoteController of the 
     * object with the given objectId. The method specified by 
     * controllerMethod will be called with the given args.
     */
    remoteControl(objectId: string, controllerMethod: string, args: unknown[] = [],
        stateUpdate: DStateUpdate<Object3D>) {
        const controller = this.remoteControllers[objectId];
        if (controller === undefined ||
            typeof controller[controllerMethod]  !== "function") {
            return false;
        }
        const result: DRemoteControlResult<Object3D> = controller[controllerMethod](
            ...args, stateUpdate);
        return result;
    }

    /**
     * Register a custom constructor for a new object type.
     * @param type - The type name for the object.
     * @param wrapper - The object containing boundArgs and the constructor function for creating objects of the specified type.
     */
    /* registerObjectType(type: string, wrapper: FunctionWrapper<Function>): World3D {
        const { boundArgs, f: constructor } = wrapper;
        if (type in this.objectTypes) {
            throw new Error("Constructor for type '" + type + "' already exists");
        }
        this.objectTypes[type] = constructor.bind(this, ...boundArgs);
        return this;
    } */

    /**
     * Create an object into the world via a given constructor function.
     * @param id - The identifier for the object.
     * @param wrapper - The object containing boundArgs and the create function.
     */
    createCustomObject(id: string, wrapper: FunctionWrapper<Function>): void {
        const { boundArgs, f: create } = wrapper;
        if (this.objects.hasObject(id)) {
            throw new Error("Object with given id '" + id + "' already exists");
        }
        this.objects.addObject(id, create.bind(this)(...boundArgs));
    }

    /**
     * Modify an object in the world via a given function.
     * @param id - The identifier for the object.
     * @param wrapper - The object containing boundArgs and the modifier function.
     */
    async modifyObject(id: string, wrapper: FunctionWrapper<Function>) {
        const { boundArgs, f: modifier } = wrapper;
        var obj = this.getObject(id);
        const result = await (modifier.bind(this, ...boundArgs)(obj));
        return result;
    }

    /**
     * Selects and renders the world map with the given id.
     * Returns whether this is successful or not.
     */
    async selectMap(id: string) {
        if (id !== this.currentMapId && maps[id] !== undefined) {
            // Switch background.
            if (this.currentBackground !== undefined) {
                this.currentBackground.destroy();
            }
            this.currentBackground = this.backgrounds[id] !== undefined ?
                this.backgrounds[id]() : this.backgrounds.Default();
            this.currentBackground.generate();
            
            // Delete all currently existing objects
            // and controllers.
            this.objects.destroyAllObjects();
            this.controllers = {};
            this.remoteControllers = {};

            // Generate map.
            const mapGenerator: TMapGenerator = maps[id];
            await mapGenerator(this.scene, this.meshConstructors, this.objects, this.globals);

            this.currentMapId = id;
            return true;
        } else {
            return false;
        }
    }

    /**
     * Initialization procedure for the World3D service.
     */
    async initialize(): Promise<boolean> {
        
        // ### Initialize BabylonJS. ###

        // Setup camera.
        this.camera = new babylonjs.ArcRotateCamera("camera1", (-1)*Math.PI/2, Math.PI/4, 20, new this.babylonjs.Vector3(0, 0, 0), this.scene);
        this.camera.fov = 1.2;

        // Setup lighting.
        [new Vector3(1, 1, 1), new Vector3(-1, 1, -1)].forEach((direction, index) => {
            let light = new HemisphericLight("light" + index, direction, this.scene);
            light.intensity = light.intensity * (0.7 + (index * 0.3));
            light.specular.scaleInPlace(0);
        });
        
        //light.groundColor = new babylonjs.Color3(0.15, 0.3, 0.6);
        this.scene.ambientColor = new babylonjs.Color3(0.15, 0.3, 0.6);
        //this.scene.clearColor = new Color4(0.75, 0.97, 1, 1);
        this._setupVerticalGradientBackground(
            new babylonjs.Color3(0.93, 0.99, 1), new babylonjs.Color3(0.61, 0.82, 1));

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
        this.gravity = new Vector3(0, -9.81, 0);
        const havokInstance = await HavokPhysics();
        this.scene.enablePhysics(this.gravity, new HavokPlugin(false, havokInstance));
        this.scene.getPhysicsEngine().setTimeStep(1 / 60);

        // Load meshes configured by the project where World3D is being used.
        this.meshConstructors = await meshConstructors(this.babylonjs, this.scene);

        this.objects.objectConstructors = objectConstructors(
            this.scene, this.meshConstructors, this.objects, this.glowLayer, this.globals);

        this.backgrounds = createBackgrounds(this.meshConstructors);
        // Setup skybox.
        /* this.skybox = this.meshConstructors["SkyBox"]();
        this.skybox.position = this.camera.position; */

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
        const startTime = Date.now();
        let lastTime = startTime;

        this.engine.runRenderLoop(() => {
            const timeNow = Date.now();
            // Time passed in total since starting the render loop.
            const absoluteTime = startTime - lastTime;
            // Time passed since last update.
            const timePassed = timeNow - lastTime;

            this.objects.doOnTick(timePassed, absoluteTime);
            if (this.currentBackground !== undefined) {
                this.currentBackground.doOnTick(timePassed, absoluteTime);
            }
            lastTime = timeNow;
            this.scene.render();
        });
    }

    /**
     * Make the world visible and running.
     */
    run() {
        this.runRenderLoop();
        this.show();
        return true;
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

    /**
     * Sets up the background to be a vertical gradient.
     */
    _setupVerticalGradientBackground(startColor: babylonjs.Color3, endColor: babylonjs.Color3) {
        // Create a render target.
        var rtt = new babylonjs.RenderTargetTexture("", 200, this.scene)
        
        // Create the background from it
        var background = new babylonjs.Layer("back", null, this.scene);
        background.isBackground = true;
        background.texture = rtt;
        
        // Create the background effect.
        var renderImage = new babylonjs.EffectWrapper({
            engine: this.engine,
            fragmentShader: `
                varying vec2 vUV;

                void main(void) {
                    vec3 startColor = vec3(${startColor.r}, ${startColor.g}, ${startColor.b});
                    vec3 endColor = vec3(${endColor.r}, ${endColor.g}, ${endColor.b});
                    gl_FragColor = vec4(mix(startColor, endColor, vUV.y), 1.0);
                }
            `
        });
        
        // When the effect has been ready,
        // Create the effect render and change which effects will be renderered
        renderImage.effect.executeWhenCompiled(() => {
            // Render the effect in the RTT.
            var renderer = new babylonjs.EffectRenderer(this.engine);
            renderer.render(renderImage, rtt);
        });
    }
}