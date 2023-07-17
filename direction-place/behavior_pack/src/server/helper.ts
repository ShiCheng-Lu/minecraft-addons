import { Direction, Vector, Vector3 } from "@minecraft/server";

export const dirToVec = new Map<Direction, Vector>()
export const vecToDir = new Map<Vector, Direction>()

// sets up dirToVec and vecToDir
function init() {
    function add(dir: Direction, vec: Vector) {
        dirToVec.set(dir, vec);
        vecToDir.set(vec, dir);
    }
    add(Direction.East, Vector.right);
    add(Direction.West, Vector.left);
    add(Direction.Up, Vector.up);
    add(Direction.Down, Vector.down);
    add(Direction.South, Vector.forward);
    add(Direction.North, Vector.back);
}
init()

/**
 * Ray trace against a block to find face, faceLocationX, and faceLocationY
 * return values are consistent with ItemUseOn event's faceLocation
 * @param location 
 * @param ray 
 * @param blockLoc 
 * @returns 
 */
export function intersect(location: Vector, ray: Vector3, blockLoc: Vector3): [Direction, number, number] {
    // add one if the ray is comming from positive direction, block is the corner closest to location
    const block = new Vector(
        blockLoc.x + +(ray.x < 0),
        blockLoc.y + +(ray.y < 0),
        blockLoc.z + +(ray.z < 0),
    );

    // time the ray intersect each plane
    const dt = Vector.divide(Vector.subtract(block, location), ray)

    const dt_max = Math.max(dt.x, dt.y, dt.z)

    // location of intercept, relative to lowest block coordinate corner
    const res = Vector.add(Vector.multiply(ray, dt_max), Vector.subtract(location, blockLoc))

    switch (dt_max) {
        case dt.z:
            return [(ray.z > 0) ? Direction.North : Direction.South, res.x, res.y]
        case dt.y:
            return [(ray.y > 0) ? Direction.Down : Direction.Up, res.x, res.z]
        case dt.x:
            return [(ray.x > 0) ? Direction.West : Direction.East, res.y, res.z]
        default:
            return [Direction.Up, 0, 0] // unreachable
    }
}
