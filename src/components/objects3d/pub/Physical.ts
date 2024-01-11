import { AbstractMesh, Mesh, MeshBuilder, PhysicsAggregate, PhysicsShapeType, TransformNode } from "@babylonjs/core";
import IPhysical from "./IPhysical";
import IObject from "./IObject";

/**
 * An object with physics.
 */
export default class Physical implements IPhysical, IObject {
    physicsAggregate: PhysicsAggregate;
    transformNode: Mesh;

    constructor(
        wrappable: AbstractMesh,
        mass: number
    ) {
        // Calculate the size for the box wrapper.
        const boundingPoints = wrappable.getHierarchyBoundingVectors();
        const width = boundingPoints.max.x - boundingPoints.min.x;
        const height = boundingPoints.max.y - boundingPoints.min.y;
        // wrappable.position.y = wrappable.position.y - height/2;

        // Create box wrapper for the given mesh.
        // This is so that physics behaves well 
        // for meshes of all shapes.
        this.transformNode = MeshBuilder.CreateBox(
            `Physical:transformNode?${wrappable.id}`, 
            {
                width: width,
                height: height
            },
            wrappable.getScene()
        );
        
        // Hide the box wrapper.
        this.transformNode.visibility = 0;

        this.transformNode.addChild(wrappable);

        this.physicsAggregate = new PhysicsAggregate(
            this.transformNode, 
            PhysicsShapeType.BOX, 
            { mass: mass,  }, 
            wrappable.getScene()
        );
    }
}