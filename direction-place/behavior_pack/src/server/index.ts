import { world, Player, BeforeItemUseOnEvent, BlockProperties, Direction, DirectionBlockProperty, system, MinecraftBlockTypes } from "@minecraft/server";
import { blocks } from "./blocks";
import "./indicator";

world.events.beforeItemUseOn.subscribe((arg: BeforeItemUseOnEvent) => {
    if (!(arg.source instanceof Player) || !arg.source.isSneaking || !blocks[arg.item.typeId]) return;

    const perm = blocks[arg.item.typeId].type.createDefaultBlockPermutation();
    const facing = perm.getProperty(BlockProperties.facingDirection) as DirectionBlockProperty

    const expectedDir = get_rotation(arg.faceLocationX, arg.faceLocationY, arg.blockFace)
    facing.value = map_by_item(arg.item.typeId, expectedDir) // some item has facing direction that are not the regular expected

    const f = world.events.blockPlace.subscribe((blockPlaceArg) => {
        if (arg.blockLocation.blocksBetween(blockPlaceArg.block.location).length > 2) return;
        // set to air first so there is no persist on piston direction, messes with power direciton
        blockPlaceArg.block.setPermutation(MinecraftBlockTypes.air.createDefaultBlockPermutation())
        blockPlaceArg.block.setPermutation(perm)
    })
    system.run(() => world.events.blockPlace.unsubscribe(f));
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
