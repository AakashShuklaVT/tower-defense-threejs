/**
 * Generate ordered waypoints with angles from level JSON.
 * @param {Object} levelData - JSON containing grid, width, height
 * @returns {Array} waypoints [{x, z, angle}]
 */
export function extractMovingPath(levelData) {
    const pathCells = levelData.grid.filter(cell => cell.type === "path")
    if (pathCells.length === 0) return []

    const offsetX = levelData.width / 2
    const offsetZ = levelData.height / 2

    // Step 1: Convert grid coords → world coords
    const points = pathCells.map(c => ({
        x: c.position.x - offsetX + 0.5,
        z: c.position.z - offsetZ + 0.5
    }))

    // Step 2: Order the path
    const ordered = [points[0]]
    const visited = new Set([`${points[0].x},${points[0].z}`])

    while (ordered.length < points.length) {
        const last = ordered[ordered.length - 1]
        const neighbor = points.find(p =>
            !visited.has(`${p.x},${p.z}`) &&
            Math.abs(p.x - last.x) + Math.abs(p.z - last.z) === 1
        )
        if (!neighbor) break
        ordered.push(neighbor)
        visited.add(`${neighbor.x},${neighbor.z}`)
    }

    // Step 3: Build waypoints with angle
    const waypoints = []
    let prev = ordered[0]
    waypoints.push({ ...prev, angle: 0 })

    for (let i = 1; i < ordered.length; i++) {
        const curr = ordered[i]
        const dx = curr.x - prev.x
        const dz = curr.z - prev.z

        let angle = 0
        if (dx === 1) angle = 90
        else if (dx === -1) angle = -90
        else if (dz === 1) angle = 0
        else if (dz === -1) angle = 180

        waypoints.push({ ...curr, angle })
        prev = curr
    }

    return waypoints
}
