import { Player, ItemUseOnAfterEvent, BlockPermutation, Direction, Vector3, Vector } from "@minecraft/server";
import { world, system } from "@minecraft/server"
import { blocks } from "./blocks";

function vectorDist(a: Vector3, b: Vector3) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z)
}

world.beforeEvents.itemUseOn.subscribe((arg: ItemUseOnAfterEvent) => {
    const player = arg.source;
    if (!(player instanceof Player) || !player.isSneaking) return;

    // const expectedDir = get_rotation(arg.faceLocation.x, arg.faceLocation.y, arg.blockFace)
    // console.warn(`${arg.faceLocation.x}, ${arg.faceLocation.y}`)
    // const facing = map_by_item(arg.itemStack.typeId, expectedDir) // some item has facing direction that are not the regular expected

    const facing = get_rotation2(arg.faceLocation)

    const block = arg.block

    system.run(() => {
        // register block place event
        const f = world.afterEvents.blockPlace.subscribe((arg) => {
            if (vectorDist(block.location, arg.block.location) > 2) return;
    
            let perm = arg.block.permutation
            
            const states = perm.getAllStates()

            console.warn(`block placed`);
            for (const i in states) {
                console.warn(`${i}: ${states[i]}`)
            }

            const facingProperty = perm.getState("facing_direction") as number
            const directionProperty = perm.getState("direction") as number
    
            const dirProperty = facingProperty ?? directionProperty;
    
            if (dirProperty == null) return; // item is not directional
            // direction, rotation
            // if (dirProperty.validValues.includes(facing)) {
            //     dirProperty.value = facing
            // } else {
            //     dirProperty.value = dirProperty.validValues[["south", "west", "north", "east"].indexOf(facing)]
            // }
            if (perm.getState("facing_direction")) {
                perm = perm.withState("facing_direction", facing)
            }
            else if (perm.getState("direction")) {
                perm = perm.withState("direction", facing)
            }
    
            // set to air first so there is no persist on piston direction, messes with power direciton
            arg.block.setPermutation(BlockPermutation.resolve("air"))
            arg.block.setPermutation(perm)
        })
        system.runTimeout(() => world.afterEvents.blockPlace.unsubscribe(f), 1);
    })
})

function map_by_item(item: string, dir: Direction) {
    if (blocks[item]) {
        // const allDirs = [Direction.up, Direction.down, Direction.north, Direction.east, Direction.south, Direction.west]
        return blocks[item].rotation.indexOf(dir)
    } else {
        switch (dir) {
            case Direction.up: return 0;
            case Direction.down: return 1;
            case Direction.north: return 3;
            case Direction.east: return 2;
            case Direction.south: return 4;
            case Direction.west: return 5;
        }
    }
}

function manhattanDist(a: Vector3, b: Vector3) {
    const gap = Vector.subtract(a, b)
    return Math.abs(gap.x) + Math.abs(gap.y) + Math.abs(gap.z)
}

function get_rotation2(location: Vector3) {
    location = Vector.add(location, {x: -0.5, y: -0.5, z: -0.5})

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
