import IState from "../../../../components/computation/pub/IState";
import IActionableState from "../../../../components/objects3d/pub/creatures/IActionableState";
import IMovableState from "../../../../components/objects3d/pub/creatures/IMovableState";
import IRotatableState from "../../../../components/objects3d/pub/creatures/IRotatableState";

export default interface IActionModeState extends 
    IState, 
    IMovableState, 
    IRotatableState, 
    IActionableState 
{
    
}