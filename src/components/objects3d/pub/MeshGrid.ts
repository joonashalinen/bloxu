import { AbstractMesh, TransformNode, Vector3 } from "@babylonjs/core";
import IObject from "./IObject";

/**
 * A cubic 3D grid where each cell contains a copy of a given mesh.
 */
export default class MeshGrid implements IObject {
    transformNode: TransformNode;
    meshes: AbstractMesh[][][];
    offset: Vector3 = new Vector3(0, 0, 0);

    constructor(
        public meshPrototype: AbstractMesh,
        public cellSize: number,
        public gridSize: {x: number, y: number, z: number}
    ) {
        this.transformNode = new TransformNode(
            `MeshGrid:transformNode?${meshPrototype.name}`,
            meshPrototype.getScene()
        );
        this.transformNode.setAbsolutePosition(new Vector3(0, 0, 0));

        // Create Meshes.
        this.meshes = [];
        for (let x = 0; x < gridSize.x; x++) {
            this.meshes.push([]);
            
            for (let y = 0; y < gridSize.y; y++) {
                this.meshes[x].push([]);
                
                for (let z = 0; z < gridSize.z; z++) {
                    const mesh = meshPrototype.clone(
                        `MeshGrid:meshes:${x}:${y}:${z}?${meshPrototype.name}`, 
                        this.transformNode
                    )!;
                    mesh.setEnabled(true);

                    this.meshes[x][y].push(mesh);
                }
            }
        }

        // Set mesh positions.
        this.map((mesh, x, y, z) => {
            mesh.position = this.calculateMeshPosition(x, y, z);
            return mesh;
        });
    }

    /**
     * Map each Mesh in the grid.
     */
    map(f: (mesh: AbstractMesh, x: number, y: number, z: number) => AbstractMesh) {
        this.meshes.map((xRow, x) => {
            return xRow.map((yRow, y) => {
                return yRow.map((mesh, z) => f(mesh, x, y, z));
            });
        });
    }

    /**
     * Calculate the (local) position coordinate of a mesh 
     * in the grid based on its cell coordinate.
     */
    calculateMeshPosition(x: number, y: number, z: number): Vector3 {
        return (new Vector3(x * this.cellSize, y * this.cellSize, z * this.cellSize)).add(this.offset);
    }

    /**
     * Whether the given mesh is part of the grid.
     */
    meshIsInGrid(mesh: AbstractMesh) {
        return (
            mesh.name.includes("MeshGrid:meshes") && 
            mesh.name.includes(this.meshPrototype.name)
        );
    }

    /**
     * Grid coordinates of the cell containing the given mesh.
     */
    meshCellCoordinates(mesh: AbstractMesh): Vector3 {
        const coordinates = mesh.name
            .split("MeshGrid:meshes")[1]
            .split(this.meshPrototype.name)[0]
            .split("?")[0]
            .slice(1)
            .split(":")
            .map((coordinateString) => parseInt(coordinateString));
        return new Vector3(coordinates[0], coordinates[1], coordinates[2]);
    }
}