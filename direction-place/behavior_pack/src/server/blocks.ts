import { BlockType, MinecraftBlockTypes } from "mojang-minecraft";

export const blocks: {
    [key: string]: {
        type: BlockType,
        rotation: [number, number, number, number, number, number]
    }
} = {
    "minecraft:piston": {
        type: MinecraftBlockTypes.piston,
        rotation: [0, 1, 3, 2, 5, 4]
    },
    "minecraft:sticky_piston": {
        type: MinecraftBlockTypes.stickyPiston,
        rotation: [0, 1, 3, 2, 5, 4]
    },
    "minecraft:dropper": {
        type: MinecraftBlockTypes.dropper,
        rotation: [0, 1, 2, 3, 4, 5]
    },
    "minecraft:dispenser": {
        type: MinecraftBlockTypes.dispenser,
        rotation: [0, 1, 2, 3, 4, 5]
    },
    "minecraft:observer": {
        type: MinecraftBlockTypes.observer,
        rotation: [1, 0, 3, 2, 5, 4]
    },
    "minecraft:hopper": {
        type: MinecraftBlockTypes.hopper,
        rotation: [0, 0, 2, 3, 4, 5]
    }
}