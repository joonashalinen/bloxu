import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { HavokPlugin } from "@babylonjs/core/Physics";
import HavokPhysics from "@babylonjs/havok";
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, Mesh, MeshBuilder } from "@babylonjs/core";
import MessengerClass from "./components/messaging/pub/MessengerClass";
import Mediator from "./components/messaging/pub/Mediator";
import World3D from "./services/world3d/pub/World3D";
import WebWorker from "./components/browser/pub/WebWorker";

class App {

    /**
     * The initialization code is separated into 
     * an async function because there are some async 
     * methods we must await.
     */
    async initialize(): Promise<void> {
        
        // ### Initialize browser DOM elements. ###
        
        // create the canvas html element and attach it to the webpage
        var canvas = document.createElement("canvas");
        canvas.style.width = "90%";
        canvas.style.height = "90%";
        canvas.id = "gameCanvas";
        document.body.appendChild(canvas);

        // ### Initialize BabylonJS. ###

        // initialize babylon scene and engine
        var engine = new Engine(canvas, true);
        var scene = new Scene(engine);

        var camera: ArcRotateCamera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, Vector3.Zero(), scene);
        camera.attachControl(canvas, true);
        var light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);
        var sphere: Mesh = MeshBuilder.CreateSphere("sphere", { diameter: 1 }, scene);

        // hide/show the Inspector
        window.addEventListener("keydown", (ev) => {
            // Shift+Ctrl+Alt+I
            if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.key === 'i') {
                if (scene.debugLayer.isVisible()) {
                    scene.debugLayer.hide();
                } else {
                    scene.debugLayer.show();
                }
            }
        });

        // Enable physics.
        const havokInstance = await HavokPhysics();
        scene.enablePhysics(
            new Vector3(0, -9.81, 0),
            new HavokPlugin(true, havokInstance)
        );

        // ### Setup services. ###

        var playerNativeWorker = new Worker(new URL('./services/player/pub/index.ts', import.meta.url))
        var playerWorker = new WebWorker(playerNativeWorker);

        var world3d = new World3D(scene);
        var messengers = {
            "world3d": new MessengerClass(world3d, world3d.emitter),
            "player1": playerWorker
        };
        var mediator = new Mediator(messengers);

        mediator.postMessage({
            recipient: "world3d",
            message: {
                type: "request",
                message: {
                    type: "createCustomObject",
                    args: ["box1", function(this: World3D) {
                        var box = this.babylonjs.MeshBuilder.CreateBox("box1", {size: 1}, this.scene);
                        return new this.babylonjs.PhysicsAggregate(
                            box, 
                            this.babylonjs.PhysicsShapeType.BOX, 
                            { mass: 1 }, 
                            scene
                        );
                    }]
                }
            }
        });

        mediator.postMessage({
            recipient: "world3d",
            message: {
                type: "request",
                message: {
                    type: "createObject",
                    args: ["movable1", "Movable", function(this: World3D) {
                        return [];
                    }]
                }
            }
        });

        mediator.postMessage({
            recipient: "player1",
            message: {
                type: "event",
                message: {
                    type: "keyPress",
                    args: [{direction: "up"}]
                }
            }
        });

        
        // ### Begin main render loop. ###

        engine.runRenderLoop(() => {
            scene.render();
        });
    }

    constructor() {
        this.initialize();
    }
}
new App();