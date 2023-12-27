import { Vector3 } from "@babylonjs/core";
export default class Movable {
    constructor(nativeObj) {
        this.direction = new Vector3(0, 0, 0);
        this.nativeObj = nativeObj;
    }
    move(direction, onlyInDirection = true) {
        if (!this.direction.equals(direction)) {
            if (onlyInDirection) {
                this.direction = direction;
            }
            else {
                this.direction = this.direction.add(direction).normalize();
            }
        }
        return this;
    }
    doOnTick(time) {
        if (!this.direction.equals(new Vector3(0, 0, 0))) {
            this.nativeObj.body.setLinearVelocity(this.direction);
        }
        return this;
    }
}
//# sourceMappingURL=Movable.js.map