import { AbstractMesh, MeshBuilder, TransformNode, Vector3 } from "@babylonjs/core";

export type TGridMapper = (mesh: AbstractMesh, cellIndex: Vector3) => AbstractMesh;

/**
 * A cubic 3D grid where each cell contains a copy of a given mesh.
 */
export default class MeshGrid {
    transformNode: TransformNode;
    meshes: AbstractMesh[][][];
    offset: Vector3 = new Vector3(0, 0, 0);
    baseOffset: Vector3 = new Vector3(0, 0, 0);
    private _prototypeMesh: AbstractMesh;

    constructor(
        prototypeMesh: AbstractMesh,
        public cellSize: number,
        public gridSize: {x: number, y: number, z: number},
        public baseId: string = "0"
    ) {
        this._prototypeMesh = prototypeMesh;
        this.transformNode = new TransformNode(
            `MeshGrid:transformNode?${this.baseId}`,
            prototypeMesh.getScene()
        );
        this.transformNode.setAbsolutePosition(new Vector3(0, 0, 0));
        this.transformNode.setEnabled(false);

        // Create Meshes.
        this.meshes = [];
        for (let x = 0; x < gridSize.x; x++) {
            this.meshes.push([]);
            
            for (let y = 0; y < gridSize.y; y++) {
                this.meshes[x].push([]);
                
                for (let z = 0; z < gridSize.z; z++) {
                    const mesh = prototypeMesh.clone(
                        `MeshGrid:mesh?${this.baseId}-${x}-${y}-${z}`, 
                        this.transformNode
                    )!;
                    mesh.setEnabled(true);

                    this.meshes[x][y].push(mesh);
                }
            }
        }

        // Set mesh positions.
        this.map((mesh, cellIndex) => {
            mesh.position = this.calculateMeshPosition(cellIndex);
            return mesh;
        });

        this.transformNode.setAbsolutePosition(
            this.transformNode.absolutePosition.add(this.offset));
    }

    /**
     * Creates a sphere wrapped in a box, which 
     * is useful as a prototype mesh for Grid.
     */
    static createSpherePrototype(cellSize: number, sphereSizeRatio: number) {
        const sphereSize = cellSize * sphereSizeRatio;
        const wrapper = MeshBuilder.CreateBox("MeshGrid:Wrapper",
            {width: cellSize, height: sphereSize, depth: cellSize});
        const sphere = MeshBuilder.CreateSphere("MeshGrid:Prototype", {diameter: sphereSize});
        wrapper.addChild(sphere);
        wrapper.visibility = 0;
        sphere.visibility = 0.5;
        wrapper.setEnabled(false);
        return wrapper;
    }

    get prototypeMesh() {
        return this._prototypeMesh;
    }

    set prototypeMesh(prototypeMesh: AbstractMesh) {
        this._prototypeMesh = prototypeMesh;
        this.map((mesh, cellIndex) => {
            const newMesh = prototypeMesh.clone(
                `MeshGrid:meshes:${cellIndex.x}:${cellIndex.y}:${cellIndex.z}?${prototypeMesh.name}`, 
                this.transformNode
            )!;
            newMesh.setAbsolutePosition(mesh.absolutePosition.clone());
            mesh.getScene().removeMesh(mesh);
            mesh.dispose(true);
            newMesh.setEnabled(true);
            return newMesh;
        });
    }

    /**
     * Map each Mesh in the grid.
     */
    map(f: TGridMapper) {
        this.meshes.map((xRow, x) => {
            return xRow.map((yRow, y) => {
                return yRow.map((mesh, z) => f(mesh, new Vector3(x, y, z)));
            });
        });
    }

    /**
     * Calculate the (local) position coordinate of a mesh 
     * in the grid based on its cell coordinate.
     */
    calculateMeshPosition(cellIndex: Vector3): Vector3 {
        // To make the grid be centered at the center position of .transformNode, 
        // we must shift the local mesh coordinates by half the size of the grid.
        const centeringOffset = new Vector3(-this.width()/2,-this.height()/2,-this.depth()/2);
        // We also need to adjust for the fact that the mesh's local coordinate space begins 
        // at the center of the mesh.
        const localOriginOffset = new Vector3(this.cellSize / 2, this.cellSize / 2, this.cellSize / 2);
        return (new Vector3(
            cellIndex.x * this.cellSize, cellIndex.y * this.cellSize, cellIndex.z * this.cellSize)
            .addInPlace(centeringOffset).addInPlace(localOriginOffset));
    }

    /**
     * Whether the given mesh is part of the grid.
     */
    meshIsInGrid(mesh: AbstractMesh) {
        return mesh.id.includes("MeshGrid:mesh") && mesh.id.includes(this.baseId);
    }

    /**
     * Grid coordinates of the cell containing the given mesh.
     */
    meshCellCoordinates(mesh: AbstractMesh): Vector3 {
        const coordinates = mesh.id
            .split("MeshGrid:mesh?" + this.baseId + "-")[1]
            .split("-")
            .map((coordinateString) => parseInt(coordinateString));
        return new Vector3(coordinates[0], coordinates[1], coordinates[2]);
    }

    /**
     * Move the grid up vertically by .cellSize amount.
     */
    raise() {
        this.offset.y += this.cellSize;
        this.updatePosition();
    }

    /**
     * Move the Grid up vertically by .cellSize amount.
     */
    lower() {
        this.offset.y -= this.cellSize;
        this.updatePosition();
    }

    /**
     * Recalculate and set the position of the grid.
     */
    updatePosition() {
        this.transformNode.setAbsolutePosition(
            this.transformNode.absolutePosition.add(this.totalOffset()));
    }

    /**
     * Returns .baseOffset + .offset.
     */
    totalOffset() {
        return this.baseOffset.add(this.offset);
    }

    /**
     * Total length of the grid along the x-axis.
     */
    width() {
        return this.gridSize.x * this.cellSize;
    }

    /**
     * Total length of the grid along the z-axis.
     */
    depth() {
        return this.gridSize.z * this.cellSize;
    }

    /**
     * Total length of the grid along the y-axis.
     */
    height() {
        return this.gridSize.y * this.cellSize;
    }
}