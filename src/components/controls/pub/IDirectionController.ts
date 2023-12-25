import {Vector2} from "@babylonjs/core";

// Define the interface for a controller 
// that can control directions. For example, a joystick controller.
export default interface IDirectionController {
  // Method to subscribe to direction movement events
  onDirectionChange(callback: (direction: Vector2) => void): void;

  // Method to unsubscribe from direction movement events
  offDirectionChange(callback: (direction: Vector2) => void): void;
}