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
        size: number,
        mass: number
    ) {
        // Create box wrapper for the given mesh.
        // This is so that physics behaves well 
        // for meshes of all shapes.
        this.transformNode = MeshBuilder.CreateBox(
            `Physical:transformNode?${wrappable.id}`, 
            {size: size},
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