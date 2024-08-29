import DVector2 from "../../graphics3d/pub/DVector2";

// Defines the interface for a controller 
// that can control directions. For example, a joystick controller.
export default interface IDirectionEmitter {
  // Method to subscribe to direction movement events
  onDirectionChange(callback: (direction: DVector2) => void): void;

  // Method to unsubscribe from direction movement events
  offDirectionChange(callback: (direction: DVector2) => void): void;
}