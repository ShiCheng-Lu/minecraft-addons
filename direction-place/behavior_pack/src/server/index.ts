import { world, Entity, Location, Player, BeforeItemUseOnEvent, BlockProperties, Direction, system, DirectionBlockProperty, Vector, MolangVariableMap, Block, BlockLocation } from "@minecraft/server";
import { blocks } from "./blocks";

world.events.beforeItemUseOn.subscribe((arg: BeforeItemUseOnEvent) => {
    if (!(arg.source instanceof Player) || !arg.source.isSneaking || !blocks[arg.item.typeId]) return;

    const expectedDir = get_rotation(arg.faceLocationX, arg.faceLocationY, arg.blockFace)
    const mappedDir = map_by_item(arg.item.typeId, expectedDir) // some item has facing direction that are not the regular expected

    console.warn(`${arg.blockFace}, ${arg.faceLocationX} ${arg.faceLocationY}`)

    const actor = arg.source;
    // listen for place event
    const placeEvent = world.events.blockPlace.subscribe(arg => {
        if (arg.player === actor) {
            const perm = arg.block.permutation;
            const facing = perm.getProperty(BlockProperties.facingDirection) as DirectionBlockProperty

            facing.value = mappedDir;
            arg.block.setPermutation(perm);
        }
    });
    const i = system.run(() => {
        world.events.blockPlace.unsubscribe(placeEvent);
        system.clearRun(i);
    })
})

function map_by_item(item: string, dir: Direction) {
    const allDirs = [Direction.up, Direction.down, Direction.north, Direction.east, Direction.south, Direction.west]
    return blocks[item].rotation[allDirs.indexOf(dir)]
}

function get_rotation(x: number, y: number, dir: Direction): Direction {
    if (Math.abs(x - 0.5) < 0.25 && Math.abs(y - 0.5) < 0.25) {
        // center, invert direction
        switch (dir) {
            case Direction.up: return Direction.down;
            case Direction.down: return Direction.up;
            case Direction.north: return Direction.south;
            case Direction.east: return Direction.west;
            case Direction.south: return Direction.north;
            case Direction.west: return Direction.east;
        }
    }
    else if (x > y && 1 - x > y) {
        // buttom
        switch (dir) {
            case Direction.up: return Direction.south;
            case Direction.down: return Direction.south;
            case Direction.north: return Direction.up;
            case Direction.east: return Direction.south;
            case Direction.south: return Direction.up;
            case Direction.west: return Direction.south;
        }
    }
    else if (x > y && 1 - x < y) {
        // right
        switch (dir) {
            case Direction.up: return Direction.west;
            case Direction.down: return Direction.west;
            case Direction.north: return Direction.west;
            case Direction.east: return Direction.down;
            case Direction.south: return Direction.west;
            case Direction.west: return Direction.down;
        }
    }
    else if (x < y && 1 - x > y) {
        // left
        switch (dir) {
            case Direction.up: return Direction.east;
            case Direction.down: return Direction.east;
            case Direction.north: return Direction.east;
            case Direction.east: return Direction.up;
            case Direction.south: return Direction.east;
            case Direction.west: return Direction.up;
        }
    }
    else if (x < y && 1 - x < y) {
        // top
        switch (dir) {
            case Direction.up: return Direction.north;
            case Direction.down: return Direction.north;
            case Direction.north: return Direction.down;
            case Direction.east: return Direction.north;
            case Direction.south: return Direction.down;
            case Direction.west: return Direction.north;
        }
    }
    return Direction.up;
}

// shit code... hard to fix
function get_rotation_2(x: number, y: number, dir: Direction) {
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

world.events.tick.subscribe((arg) => {
    for (const player of world.getPlayers()) {
        if (!player.isSneaking) continue;
        // only activate indicator if sneaking

        const block = player.getBlockFromViewVector({ maxDistance: 10 })
        if (block === null) return;

        const [face, rotation] = intersect(player.headLocation, player.viewVector, block.location)

        putIndicator(block, face, rotation);
    }
});

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
    const rotation = get_rotation_2(x, y, face)

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
