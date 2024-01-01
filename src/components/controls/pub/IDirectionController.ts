import {Vector2} from "@babylonjs/core";
import TCompassPoint from "../../geometry/pub/TCompassPoint";

// Define the interface for a controller 
// that can control directions. For example, a joystick controller.
export default interface IDirectionController {
  // Method to subscribe to direction movement events
  onDirectionChange(callback: (direction: Vector2) => void): void;

  // Method to unsubscribe from direction movement events
  offDirectionChange(callback: (direction: Vector2) => void): void;

  /**
   * When a discrete direction change event has occurred 
   * in one of 8 compass point directions. A D-pad controller 
   * could for example implement this for the main 4 cardinal directions.
   */
  onCompassPointChange(callback: (direction: TCompassPoint) => void): void;
}