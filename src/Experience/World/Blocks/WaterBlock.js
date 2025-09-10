import * as THREE from 'three'
import Experience from '../../Experience.js'

export default class WaterBlock {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.debug = this.experience.debug

        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('Water')
        }

        this.setMesh()
    }

    setMesh() {
        const size = 70
        this.geometry = new THREE.PlaneGeometry(size, size, 80, 80)
        this.geometry.rotateX(-Math.PI * 0.5)

        // Vertex data for wave animation
        this.vertData = []
        const v3 = new THREE.Vector3()
        for (let i = 0; i < this.geometry.attributes.position.count; i++) {
            v3.fromBufferAttribute(this.geometry.attributes.position, i)
            this.vertData.push({
                initH: v3.y,
                amplitude: THREE.MathUtils.randFloat(0.3, 0.5),
                phase: THREE.MathUtils.randFloat(0, Math.PI * 2)
            })
        }

        // Create vertex colors (gradient along Z axis)
        const colors = []
        const positions = this.geometry.attributes.position

        // find min/max Z for normalization
        let minZ = Infinity, maxZ = -Infinity
        for (let i = 0; i < positions.count; i++) {
            const z = positions.getZ(i)
            if (z < minZ) minZ = z
            if (z > maxZ) maxZ = z
        }

        for (let i = 0; i < positions.count; i++) {
            const z = positions.getZ(i)
            const t = THREE.MathUtils.mapLinear(z, minZ, maxZ, 0, 1) // normalize 0→1

            const color = new THREE.Color().lerpColors(
                new THREE.Color(0x0a4a6e), // deep blue
                new THREE.Color(0x1ca3ec), // light blue
                t
            )
            colors.push(color.r, color.g, color.b)
        }

        this.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

        this.material = new THREE.MeshLambertMaterial({
            vertexColors: true,
            side: THREE.DoubleSide
        })

        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.position.y = -2.0
        this.scene.add(this.mesh)
    }

    update() {
        if (!this.mesh) return

        const elapsedTime = this.time.elapsed * 0.002

        this.vertData.forEach((vd, idx) => {
            const wave1 = Math.sin(elapsedTime * 2.2 + vd.phase + idx * 0.02) * vd.amplitude * 0.5
            const wave2 = Math.cos(elapsedTime * 1.6 + vd.phase * 1.5 + idx * 0.018) * vd.amplitude * 0.2
            const wave3 = Math.sin(elapsedTime * 1.0 + idx * 0.12) * 0.1

            const y = vd.initH + wave1 + wave2 + wave3
            this.geometry.attributes.position.setY(idx, y)
        })

        this.geometry.attributes.position.needsUpdate = true
        this.geometry.computeVertexNormals()
    }
}
