import IState from "../../../../components/computation/pub/IState";
import { IPointable } from "../../../../components/graphics2d/pub/IPointable";
import IActionableState from "../../../../components/objects3d/pub/creatures/IActionableState";
import IKeyableState from "../../../../components/objects3d/pub/creatures/IKeyableState";
import IMovableState from "../../../../components/objects3d/pub/creatures/IMovableState";
import IRotatableState from "../../../../components/objects3d/pub/creatures/IRotatableState";

export default interface IActionModeState extends 
    IState, 
    IMovableState, 
    IRotatableState, 
    IActionableState,
    IKeyableState,
    IPointable
{
    
}