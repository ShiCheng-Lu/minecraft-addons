import { world, Location, Direction, Vector, MolangVariableMap, Block, BlockLocation } from "@minecraft/server";

world.events.tick.subscribe((arg) => {
    for (const player of world.getPlayers()) {
        // only activate indicator if sneaking
        if (!player.isSneaking) continue;

        const block = player.getBlockFromViewVector({ maxDistance: 10 })
        if (block === null) return;

        const [face, rotation] = intersect(player.headLocation, player.viewVector, block.location)

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

function intersect(location: Location, ray: Vector, blockLoc: BlockLocation): [Direction, number] {
    const block = new Vector(blockLoc.x, blockLoc.y, blockLoc.z);
    block.x += (ray.x > 0) ? 0 : 1;
    block.y += (ray.y > 0) ? 0 : 1;
    block.z += (ray.z > 0) ? 0 : 1;

    const dz = (block.z - location.z) / ray.z;
    const dy = (block.y - location.y) / ray.y;
    const dx = (block.x - location.x) / ray.x;

    var face = Direction.up, x = 0, y = 0, z = 0;
    switch (Math.max(dx, dy, dz)) {
        case dz:
            face = (ray.z > 0) ? Direction.north : Direction.south;
            // intersect at xy plane is
            x = dz * ray.x + location.x - blockLoc.x
            y = dz * ray.y + location.y - blockLoc.y
            break;
        case dy:
            face = (ray.y > 0) ? Direction.down : Direction.up;
            // intersect at xz plane is
            x = dy * ray.x + location.x - blockLoc.x
            y = dy * ray.z + location.z - blockLoc.z
            break;
        case dx:
            face = (ray.x > 0) ? Direction.west : Direction.east;
            // intersect at yz plane is
            x = dx * ray.y + location.y - blockLoc.y
            y = dx * ray.z + location.z - blockLoc.z
            break;
    }
    const rotation = get_rotation(x, y, face)

    return [face, rotation * 90]
}

function putIndicator(block: Block, face: Direction, rotation: number) {
    const location = new Location(block.location.x, block.location.y, block.location.z);
    const direction = new Vector(0, 0, 0);
    const offset = 0.501

    switch (face) {
        case Direction.up:
            location.y += offset;
            direction.y = -1;
            break;
        case Direction.down:
            location.y -= offset;
            direction.y = 1;
            break;
        case Direction.north:
            location.z -= offset;
            direction.z = -1;
            break;
        case Direction.east:
            location.x += offset;
            direction.x = 1;
            break;
        case Direction.south:
            location.z += offset;
            direction.z = 1;
            break;
        case Direction.west:
            location.x -= offset;
            direction.x = -1;
            break;
    }

    const varMap = new MolangVariableMap()
    varMap.setVector3("variable.rotation", new Vector(rotation, 0, 0))
    varMap.setVector3("variable.direction", direction)
    block.dimension.spawnParticle((rotation < 0) ? "direction:particle_center" : "direction:particle", location, varMap)
}
