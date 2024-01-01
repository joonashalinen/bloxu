import TCompassPoint from "../../geometry/pub/TCompassPoint";
import DVector2 from "./DVector2";

/**
 * A vector that is in the direction of a compass point.
 */
export default class CompassPointVector {
    vector: DVector2;
    
    constructor(public compassPoint: TCompassPoint) {
        this.setCompassPoint(compassPoint);
    }

    /**
     * Set the vector from a discrete compass point value.
     */
    setCompassPoint(compassPoint: TCompassPoint) {
        this.compassPoint = compassPoint;

        let x = 0;
        let y = 0;

        if (this.compassPoint.includes("north")) {
            y += 1;
        }
        if (this.compassPoint.includes("south")) {
            y -= 1;
        }
        if (this.compassPoint.includes("west")) {
            x -= 1;
        }
        if (this.compassPoint.includes("east")) {
            x += 1;
        }

        // Normalize the vector.
        const length = Math.sqrt(x * x + y * y);
        if (length !== 0) {
            x /= length;
            y /= length;
        }

        this.vector = {x: x, y: y};
    }
}