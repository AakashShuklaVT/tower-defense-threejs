import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'


export default function mergeModelToSingleGeometry(root) {
    root.updateMatrixWorld(true);

    const geoms = [];
    root.traverse((child) => {
        if (child.isMesh) {
            const g = child.geometry.clone();

            // ✅ bake world transform relative to root
            const relativeMatrix = new THREE.Matrix4();
            relativeMatrix.copy(child.matrixWorld).premultiply(new THREE.Matrix4().copy(root.matrixWorld).invert());

            g.applyMatrix4(relativeMatrix);

            geoms.push(g);
        }
    });

    if (geoms.length === 0) return null;

    // normalize attributes
    const attrItemSize = {};
    geoms.forEach((g) => {
        for (const name in g.attributes) {
            if (!(name in attrItemSize)) attrItemSize[name] = g.attributes[name].itemSize;
        }
    });

    geoms.forEach((g) => {
        const vertexCount = g.attributes.position.count;
        for (const name in attrItemSize) {
            if (!g.attributes[name]) {
                const itemSize = attrItemSize[name];
                const array = new Float32Array(vertexCount * itemSize);
                g.setAttribute(name, new THREE.BufferAttribute(array, itemSize));
            }
        }
    });

    return mergeGeometries(geoms, true);
}