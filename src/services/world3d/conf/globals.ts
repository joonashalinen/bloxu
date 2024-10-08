import PickerPlacer from "../../../components/objects3d/pub/items/PickerPlacer";
import ObjectGrid from "../../../components/objects3d/pub/ObjectGrid";

export default function createGlobals() {
    const cellSize = 1.4;
    return {
        cellSize: cellSize,
        objectGrid: new ObjectGrid(cellSize),
        pickerPlacers: new Set() as Set<PickerPlacer>
    };
}