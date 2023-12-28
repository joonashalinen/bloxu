import DVector3 from "../../../components/graphics3d/pub/DVector3";

export default interface IPlayer {
    /**
     * Spawn the player's character at the given position 
     * in the world.
     */
    spawn(startingPosition: DVector3): boolean;
}