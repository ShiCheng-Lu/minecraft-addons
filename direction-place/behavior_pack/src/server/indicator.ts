import { world, Location, Direction, Vector, MolangVariableMap, Block } from "@minecraft/server";
import { intersect, dirToVec, toVector, fromVector } from "./helper"

world.events.tick.subscribe((arg) => {
    for (const player of world.getPlayers()) {
        // only activate indicator if sneaking
        if (!player.isSneaking) continue;

        const block = player.getBlockFromViewVector({ maxDistance: 10 })
        if (block === null) return;

        // player crosshair origin is -0.025 lower than headLocation while crouching
        //                            +0.1   higher                  while standing
        const origin = new Vector(player.headLocation.x, player.headLocation.y - 0.025, player.headLocation.z)
        const [face, x, y] = intersect(origin, player.viewVector, block.location)

        const rotation = get_rotation(x, y, face) * 90;

        putIndicator(block, face, rotation);
    }
});

// shit code... hard to fix
function get_rotation(x: number, y: number, dir: Direction) {
    if (Math.abs(x - 0.5) < 0.25 && Math.abs(y - 0.5) < 0.25) {
        return -1;
    }
    else if (x > y && 1 - x > y) {
        // buttom
        switch (dir) {
            case Direction.up: return 3; //
            case Direction.down: return 3; // 
            case Direction.north: return 3; //
            case Direction.east: return 0; // 
            case Direction.south: return 3;
            case Direction.west: return 2;
        }
    }
    else if (x > y && 1 - x < y) {
        // right
        switch (dir) {
            case Direction.up: return 2;
            case Direction.down: return 0;
            case Direction.north: return 2;
            case Direction.east: return 1;
            case Direction.south: return 0;
            case Direction.west: return 1;
        }
    }
    else if (x < y && 1 - x > y) {
        // left
        switch (dir) {
            case Direction.up: return 0;
            case Direction.down: return 2;
            case Direction.north: return 0;
            case Direction.east: return 3;
            case Direction.south: return 2;
            case Direction.west: return 3;
        }
    }
    else if (x < y && 1 - x < y) {
        // top
        switch (dir) {
            case Direction.up: return 1;
            case Direction.down: return 1;
            case Direction.north: return 1;
            case Direction.east: return 2;
            case Direction.south: return 1;
            case Direction.west: return 0;
        }
    }
    return 0;
}

function putIndicator(block: Block, face: Direction, rotation: number) {
    const direction = dirToVec.get(face)!!;
    const offsetVec = Vector.multiply(direction, 0.501);
    const location = Vector.add(toVector(block.location), offsetVec)

    const varMap = new MolangVariableMap()
    varMap.setVector3("v.rotation", new Vector(rotation, 0, 0))
    varMap.setVector3("v.direction", direction)

    block.dimension.spawnParticle(
        (rotation < 0) ? "direction:particle_center" : "direction:particle",
        fromVector(location, Location),
        varMap
    )
}
