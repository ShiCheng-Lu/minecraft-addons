import { world, Direction, Vector, MolangVariableMap, Block, system } from "@minecraft/server";
import { intersect, dirToVec } from "./helper"

system.runInterval(displayIndicator)

const nonSolidFullBlocks: string[] = [
    "minecraft:leaves",
    "minecraft:leaves2",
    "minecraft:azalea_leaves",
    "minecraft:azalea_leaves_flowered",
    "minecraft:cherry_leaves",
    "minecraft:mangrove_leaves",
    "minecraft:mangrove_roots",
    "minecraft:hopper",
    "minecraft:scaffolding",
    "minecraft:glass",
    "minecraft:stained_glass",
    "minecraft:cauldron",
    "minecraft:composter",
    "minecraft:undyed_shulker_box",
    "minecraft:shulker_box",
    "minecraft:piston",
    "minecraft:sticky_piston",
    "minecraft:ice",
]

function displayIndicator() {
    for (const player of world.getPlayers()) {
        // only activate indicator if sneaking
        if (!player.isSneaking) continue;

        const raycastResult = player.getBlockFromViewDirection({ maxDistance: 12 })
        if (raycastResult == null) return;

        const block = raycastResult.block;
        // const face = raycastResult.face;
        // const rotation = remap_rotation(get_rotation(raycastResult.faceLocation), face) * 90;


        if (block == null) return; // null or undefined

        if (!block.isSolid() && !nonSolidFullBlocks.includes(block.typeId)) {
            // console.warn(`${block.typeId} is not solid`)
            return;
        }
        // player crosshair origin is +0.1 higher than headLocation
        const origin = Vector.add(player.getHeadLocation(), {x: 0, y: 0.1, z: 0})
        const blockCenter = Vector.add(block.location, {x: 0.5, y: 0.5, z: 0.5})

        if (Vector.distance(origin, blockCenter) > 6) return;

        const [face, x, y] = intersect(origin, player.getViewDirection(), block.location)

        const rotation = get_rotation(x, y, face) * 90;

        putIndicator(block, face, rotation);
    }
}

// function remap_rotation(rotation: number, direction: Direction): number {
//     switch (direction) {
//         case Direction.Up:
//             return rotation;
//         case Direction.Up:
//             return rotation;
//         case Direction.Up:
//             return rotation;
//         case Direction.Up:
//             return rotation;
//         case Direction.Up:
//             return rotation;
//         case Direction.Up:
//             return rotation;
//         default:
//             return -1;
//     }
// }



// shit code... hard to fix
function get_rotation(x: number, y: number, dir: Direction) {
    if (Math.abs(x - 0.5) < 0.25 && Math.abs(y - 0.5) < 0.25) {
        return -1;
    }
    else if (x > y && 1 - x > y) {
        // buttom
        switch (dir) {
            case Direction.Up: return 3;
            case Direction.Down: return 3;
            case Direction.North: return 3;
            case Direction.East: return 0;
            case Direction.South: return 3;
            case Direction.West: return 2;
        }
    }
    else if (x > y && 1 - x < y) {
        // right
        switch (dir) {
            case Direction.Up: return 2;
            case Direction.Down: return 0;
            case Direction.North: return 2;
            case Direction.East: return 1;
            case Direction.South: return 0;
            case Direction.West: return 1;
        }
    }
    else if (x < y && 1 - x > y) {
        // left
        switch (dir) {
            case Direction.Up: return 0;
            case Direction.Down: return 2;
            case Direction.North: return 0;
            case Direction.East: return 3;
            case Direction.South: return 2;
            case Direction.West: return 3;
        }
    }
    else if (x < y && 1 - x < y) {
        // top
        switch (dir) {
            case Direction.Up: return 1;
            case Direction.Down: return 1;
            case Direction.North: return 1;
            case Direction.East: return 2;
            case Direction.South: return 1;
            case Direction.West: return 0;
        }
    }
    return 0;
}

/**
 * 
 * @param block block to display indicator on
 * @param face face to display indicator on
 * @param rotation rotation of the indicator, -1 if it's a center indicator
 */
function putIndicator(block: Block, face: Direction, rotation: number) {
    const direction = dirToVec.get(face)!!;
    const offsetVec = Vector.multiply(direction, 0.502);
    const location = Vector.add(block.location, offsetVec)

    const varMap = new MolangVariableMap()
    // store rotation in "variable.transform.speed", directions in "variable.transform.direction_<x,y,z>"
    varMap.setSpeedAndDirection("variable.transform", rotation, direction);

    block.dimension.spawnParticle(
        (rotation < 0) ? "direction:particle_center" : "direction:particle",
        location,
        varMap
    )
}
