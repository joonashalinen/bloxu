import { Matrix, Mesh, PointerEventTypes, Vector2, Vector3 } from "@babylonjs/core";
import EventEmitter from "../../events/pub/EventEmitter";

/**
 * Represents the 2D vector that is formed 
 * between a given Mesh's projection on to the screen
 * and the mouse pointer. This vector can be though of as a 
 * 2D 'leash' between the mouse pointer and the Mesh.
 */
export default class MeshLeash2D {
    emitter = new EventEmitter();
    lastLeash: Vector2;

    constructor(public mesh: Mesh) {
        const scene = mesh.getScene();
        const engine = scene.getEngine();
        scene.onPointerObservable.add((pointerInfo) => {
            if (pointerInfo.type === PointerEventTypes.POINTERMOVE) {
                // Coordinates of the mesh when projected to the 2D screen.
                const meshPositionOnScreen3D = Vector3.Project(
                    mesh.getAbsolutePosition(),
                    Matrix.IdentityReadOnly,
                    scene.getTransformMatrix(),
                    scene.activeCamera.viewport.toGlobal(
                        engine.getRenderWidth(),
                        engine.getRenderHeight(),
                    )
                );
                const meshPositionOnScreen = new Vector2(
                    meshPositionOnScreen3D.x,
                    meshPositionOnScreen3D.y,
                );
                const mousePosition = new Vector2(
                    scene.pointerX,
                    scene.pointerY
                );
                const leash = mousePosition.subtract(meshPositionOnScreen);
                this.lastLeash = leash;
                this.emitter.trigger("change", [{
                    meshPositionOnScreen: meshPositionOnScreen,
                    mousePosition: mousePosition,
                    leash: leash
                }]);
            }
        });
    }

    /**
     * When the leash changes, i.e. the mouse moves.
     */
    onChange(handler: Function) {
        this.emitter.on("change", handler);
    }
}