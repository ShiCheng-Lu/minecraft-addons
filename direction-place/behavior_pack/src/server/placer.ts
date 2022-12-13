import { world, Player, BeforeItemUseOnEvent, BlockProperties, Direction, DirectionBlockProperty, system, MinecraftBlockTypes, EntityInventoryComponent } from "@minecraft/server";
import { blocks } from "./blocks";

world.events.beforeItemUseOn.subscribe((arg: BeforeItemUseOnEvent) => {
    const player = arg.source;
    if (!(player instanceof Player) || !player.isSneaking) return;

    const expectedDir = get_rotation(arg.faceLocationX, arg.faceLocationY, arg.blockFace)
    const facing = map_by_item(arg.item.typeId, expectedDir) // some item has facing direction that are not the regular expected

    const block = arg.blockLocation

    const f = world.events.blockPlace.subscribe((arg) => {
        if (block.blocksBetween(arg.block.location).length > 2) return;

        const perm = arg.block.permutation
        const facingProperty = perm.getProperty(BlockProperties.facingDirection) as DirectionBlockProperty
        const directionProperty = perm.getProperty(BlockProperties.direction) as DirectionBlockProperty

        const dirProperty = facingProperty ?? directionProperty;

        if (dirProperty === null) return; // item is not directional

        // direction, rotation
        if (dirProperty.validValues.includes(facing)) {
            dirProperty.value = facing
        } else {
            dirProperty.value = dirProperty.validValues[["south", "west", "north", "east"].indexOf(facing)]
        }

        // set to air first so there is no persist on piston direction, messes with power direciton
        arg.block.setPermutation(MinecraftBlockTypes.air.createDefaultBlockPermutation())
        arg.block.setPermutation(perm)
    })
    system.run(() => world.events.blockPlace.unsubscribe(f));
})

function map_by_item(item: string, dir: Direction) {
    if (blocks[item]) {
        const allDirs = [Direction.up, Direction.down, Direction.north, Direction.east, Direction.south, Direction.west]
        return blocks[item].rotation[allDirs.indexOf(dir)]
    } else {
        return dir;
    }
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
