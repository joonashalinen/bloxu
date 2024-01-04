import * as babylonjs from "@babylonjs/core";

export default interface DMeshLeash2D {
    meshPositionOnLeashPlane: babylonjs.Vector2,
    mousePosition: babylonjs.Vector2,
    leash: babylonjs.Vector2
}