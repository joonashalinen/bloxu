import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, Mesh, MeshBuilder } from "@babylonjs/core";
import Movable from "./components/objects3d/pub/Movable";
import MessengerClass from "./components/messaging/pub/MessengerClass";
import Mediator from "./components/messaging/pub/Mediator";
import World3D from "./services/world3d/pub/World3D";

class App {
    constructor() {

        /* const worker = new Worker(new URL('./worker.ts', import.meta.url));

        worker.postMessage({
            question:
              'The Answer to the Ultimate Question of Life, The Universe, and Everything.',
          });

          worker.onmessage = ({ data: { answer } }) => {
            console.log(answer);
          }; */

        // create the canvas html element and attach it to the webpage
        var canvas = document.createElement("canvas");
        canvas.style.width = "80%";
        canvas.style.height = "80%";
        canvas.id = "gameCanvas";
        document.body.appendChild(canvas);

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

        var world3d = new World3D();
        var messengers = {
            "world3d": new MessengerClass(world3d, world3d.emitter)
        };
        var mediator = new Mediator(messengers);

        mediator.postMessage({
            recipient: "world3d",
            message: {
                method: "createObject",
                args: ["movable1", "Movable"]
            }
        });

        // Run the main render loop.
        engine.runRenderLoop(() => {
            mediator.postMessage({
                recipient: "world3d",
                message: {
                    method: "modifyObject",
                    args: ["movable1", (obj: Movable) => obj.move(new Vector3(0, 0, 0))]
                }
            })
            scene.render();
        });
    }
}
new App();