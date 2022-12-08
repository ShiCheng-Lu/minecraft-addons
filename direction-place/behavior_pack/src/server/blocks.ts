import { BlockType, MinecraftBlockTypes, Direction } from "@minecraft/server";

export const blocks: {
    [key: string]: {
        type: BlockType,
        rotation: [Direction, Direction, Direction, Direction, Direction, Direction]
        // facing  up         down       north      east       south      west
    }
} = {
    "minecraft:piston": {
        type: MinecraftBlockTypes.piston,
        rotation: [Direction.up, Direction.down, Direction.south, Direction.west, Direction.north, Direction.east]
    },
    "minecraft:sticky_piston": {
        type: MinecraftBlockTypes.stickyPiston,
        rotation: [Direction.up, Direction.down, Direction.south, Direction.west, Direction.north, Direction.east]
    },
    "minecraft:dropper": {
        type: MinecraftBlockTypes.dropper,
        rotation: [Direction.up, Direction.down, Direction.north, Direction.east, Direction.south, Direction.west]
    },
    "minecraft:dispenser": {
        type: MinecraftBlockTypes.dispenser,
        rotation: [Direction.up, Direction.down, Direction.north, Direction.east, Direction.south, Direction.west]
    },
    "minecraft:observer": {
        type: MinecraftBlockTypes.observer,
        rotation: [Direction.down, Direction.up, Direction.south, Direction.west, Direction.north, Direction.east]
    },
    "minecraft:hopper": {
        type: MinecraftBlockTypes.hopper,
        rotation: [Direction.down, Direction.down, Direction.south, Direction.west, Direction.north, Direction.east]
    }
}