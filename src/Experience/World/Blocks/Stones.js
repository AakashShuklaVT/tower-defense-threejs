import * as THREE from 'three'
import Experience from '../../Experience.js'
import Grass from './Grass.js'
import mergeModelToSingleGeometry from '../../Utils/UtilityFunctions.js'
import { STONE_SCALING } from '../../Configs/GameConfig.js'

export default class Stones {
    constructor({ position = { x: 0, z: 0 } }) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.debug = this.experience.debug

        this.position = position

        // Debug
        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('Trees')
        }
        // Resource
        this.stoneTypes = ['stone1', 'stone2', 'stone3']
        this.selectedStone = Math.floor(Math.random() * this.stoneTypes.length)
        this.stoneType = this.stoneTypes[this.selectedStone]
        this.resource = this.resources.items[this.stoneType]
        this.setModel()
    }

    setModel() {
        this.model = this.resource.scene.clone()
        this.model.position.set(this.position.x, this.selectedStone !== 1 ? 0 : -0.2, this.position.z)
        this.model.rotation.set(0, Math.floor(Math.PI * 2 * Math.random()), 0)
        this.model.scale.set(STONE_SCALING[this.selectedStone], STONE_SCALING[this.selectedStone], STONE_SCALING[this.selectedStone])
        this.scene.add(this.model)

        this.model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true
                child.receiveShadow = true
                child.material.color = new THREE.Color(0xaaaaaa)
            }
        })
    }

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
