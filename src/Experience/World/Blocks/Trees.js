import * as THREE from 'three'
import Experience from '../../Experience.js'
import { TREES_SCALING } from '../../Configs/GameConfig.js'
import mergeModelToSingleGeometry from '../../Utils/UtilityFunctions.js'
export default class Trees {
    static instances = [] // keep track of all created Trees

    constructor({ position = { x: 0, z: 0 } }) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.debug = this.experience.debug

        this.position = position

        // Debug
        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('Trees')
        }

        // Tree type
        this.treeTypes = ['tree1', 'tree2', 'tree5']
        this.selectedTree = Math.floor(Math.random() * this.treeTypes.length)
        this.treeType = this.treeTypes[this.selectedTree]
        this.resource = this.resources.items[this.treeType]

        this.setModel()

        // Store this instance for later batching
        Trees.instances.push(this)
    }

    setModel() {
        this.model = this.resource.scene.clone()
        this.model.position.set(this.position.x, 0, this.position.z)
        this.model.scale.set(
            TREES_SCALING[this.selectedTree],
            TREES_SCALING[this.selectedTree],
            TREES_SCALING[this.selectedTree]
        )
        this.scene.add(this.model)

        this.model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true
                child.receiveShadow = true
            }
        })
    }

    /**
     * Combine all tree meshes into 3 instanced meshes (tree1, tree2, tree3),
     * by merging each tree model into one geometry.
     */
    static combineIntoInstancedMeshes(trees, scene) {
        if (trees.length === 0) return;

        // Group by treeType
        const grouped = {};
        trees.forEach((tree) => {
            if (!grouped[tree.treeType]) grouped[tree.treeType] = [];
            grouped[tree.treeType].push(tree);
        });

        Object.entries(grouped).forEach(([treeType, group]) => {
            const original = group[0].resource.scene;
            const mergedGeometry = mergeModelToSingleGeometry(original);

            if (!mergedGeometry) return;

            // Use first material (assumes all share)
            let mergedMaterial = null;
            original.traverse((child) => {
                if (child.isMesh && !mergedMaterial) mergedMaterial = child.material.clone();
            });

            const instancedMesh = new THREE.InstancedMesh(
                mergedGeometry,
                mergedMaterial,
                group.length
            );

            const dummy = new THREE.Object3D();
            group.forEach((tree, i) => {
                tree.model.updateMatrixWorld(true);
                dummy.position.copy(tree.model.position);
                dummy.quaternion.copy(tree.model.quaternion);
                dummy.scale.copy(tree.model.scale);
                dummy.updateMatrix();

                instancedMesh.setMatrixAt(i, dummy.matrix);

                // 🔥 Cleanup old models
                scene.remove(tree.model);
                tree.model.traverse((child) => {
                    if (child.isMesh) {
                        child.geometry.dispose();
                        if (child.material.map) child.material.map.dispose();
                        child.material.dispose();
                    }
                });

                // 🔥 Cleanup grass ground too
                if (tree.ground && tree.ground.mesh) {
                    scene.remove(tree.ground.mesh);
                    tree.ground.geometry.dispose();
                    tree.ground.material.dispose();
                }
            });

            instancedMesh.instanceMatrix.needsUpdate = true;
            instancedMesh.castShadow = true;
            instancedMesh.receiveShadow = true;
            scene.add(instancedMesh);
        });
    }
}