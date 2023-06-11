import { Player, ItemUseOnAfterEvent, BlockPermutation, Vector3, Vector } from "@minecraft/server";
import { world } from "@minecraft/server"
import { dirToVec } from "./helper"
import { map_by_block } from "./blocks"

world.afterEvents.itemUseOn.subscribe((arg: ItemUseOnAfterEvent) => {
    const player = arg.source;
    if (!(player instanceof Player) || !player.isSneaking) return;

    // if the block is not a full block
    if (arg.faceLocation.x != 1 && arg.faceLocation.x != 0 &&
        arg.faceLocation.y != 1 && arg.faceLocation.y != 0 &&
        arg.faceLocation.z != 1 && arg.faceLocation.z != 0) return;

    // get the block that would have been placed by the item use
    const blockLocation = Vector.add(arg.block.location, dirToVec.get(arg.blockFace)!)
    const block = arg.block.dimension.getBlock(blockLocation)!

    // block does not match the item used
    if (block.typeId != arg.itemStack.typeId) return

    const facing = map_by_block(get_rotation(arg.faceLocation), block.typeId)
    if (facing == -1) return;

    // place block:
    for (const state of ["facing_direction", "direction", "weirdo_direction"]) {
        if (block.permutation.getState(state) !== undefined) {
            const perm = block.permutation.withState(state, facing)

            // console.warn("placed")
            block.setPermutation(BlockPermutation.resolve("air"))
            block.setPermutation(perm)
            break;
        }
    }
})

function manhattanDist(a: Vector3, b: Vector3) {
    const gap = Vector.subtract(a, b)
    return Math.abs(gap.x) + Math.abs(gap.y) + Math.abs(gap.z)
}

function get_rotation(location: Vector3) {
    location = Vector.add(location, { x: -0.5, y: -0.5, z: -0.5 })

    if (location.x != 0.5 && location.x > 0.25 && manhattanDist(location, Vector.right) < 1.5) {
        return 4;
    }
    if (location.x != -0.5 && location.x < -0.25 && manhattanDist(location, Vector.left) < 1.5) {
        return 5;
    }

    if (location.y != 0.5 && location.y > 0.25 && manhattanDist(location, Vector.up) < 1.5) {
        return 0;
    }
    if (location.y != -0.5 && location.y < -0.25 && manhattanDist(location, Vector.down) < 1.5) {
        return 1;
    }

    if (location.z != 0.5 && location.z > 0.25 && manhattanDist(location, Vector.forward) < 1.5) {
        return 2;
    }
    if (location.z != -0.5 && location.z < -0.25 && manhattanDist(location, Vector.back) < 1.5) {
        return 3;
    }
    // center
    if (location.x === 0.5) return 4;
    if (location.x === -0.5) return 5;
    if (location.y === 0.5) return 0;
    if (location.y === -0.5) return 1;
    if (location.z === 0.5) return 2;
    if (location.z === -0.5) return 3;

    return 0
}
