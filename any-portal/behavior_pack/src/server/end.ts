import { BlockLocation, BoolBlockProperty, Dimension, IntBlockProperty, MinecraftBlockTypes, world } from "@minecraft/server";
import { searchBlock } from "./index"

function findFrame(loc: BlockLocation, dir: number, dim: Dimension) {
    var corner0, corner1;

    for (let i = 0; i < 5; ++i) {
        locDeltas[dir](loc);
        loc = searchBlock(loc, locDeltas[dir], (loc: BlockLocation) => {
            const b = dim.getBlock(loc);
            return (
                (b.type === MinecraftBlockTypes.endPortalFrame) &&
                (b.permutation.getProperty("end_portal_eye_bit") as BoolBlockProperty).value &&
                ((b.permutation.getProperty("direction") as IntBlockProperty).value === dir)
            )
        });
        if (dir === 1 && !corner0) {
            corner0 = new BlockLocation(loc.x - 1, loc.y, loc.z - 1);
        }
        if (dir === 3 && !corner1) {
            corner1 = new BlockLocation(loc.x + 1, loc.y, loc.z + 1);
        }
        if (dir === 3) {
            dir = -1;
        }
        dir++;
    }
    return [corner0, corner1];
}

const locDeltas = [
    (l: BlockLocation) => l.x++,
    (l: BlockLocation) => l.z++,
    (l: BlockLocation) => l.x--,
    (l: BlockLocation) => l.z--,
]

world.events.itemUseOn.subscribe((arg) => {
    const dim = arg.source.dimension;

    const block = dim.getBlock(arg.blockLocation);

    if (block.type === MinecraftBlockTypes.endPortalFrame && arg.item.typeId == "minecraft:ender_eye" && !arg.source.isSneaking) {

        const dir = (block.permutation.getProperty("direction") as IntBlockProperty).value;
        const loc = block.location;

        const [corner0, corner1] = findFrame(loc, dir, dim);
        if (corner0 === undefined || corner1 === undefined) {
            return;
        }
        if (corner0.x < corner1.x || corner0.z < corner1.z ||
            loc.x !== block.location.x || loc.z !== block.location.z) {
            return;
        }

        for (const b of corner0.blocksBetween(corner1)) {
            dim.getBlock(b).setType(MinecraftBlockTypes.endPortal);
        }

        arg.source.runCommandAsync(`playsound block.end_portal.spawn @a ${loc.x} ${loc.y} ${loc.z}`);
    }
})

world.events.blockBreak.subscribe((arg) => {
    if ((arg.brokenBlockPermutation.getProperty("end_portal_eye_bit") as BoolBlockProperty)?.value) {

        const dir = (arg.brokenBlockPermutation.getProperty("direction") as IntBlockProperty).value;
        const loc = arg.block.location;

        const [corner0, corner1] = findFrame(loc, dir, arg.dimension);
        if (corner0 === undefined || corner1 === undefined) {
            return;
        }
        if (corner0.x < corner1.x || corner0.z < corner1.z ||
            loc.x !== arg.block.location.x || loc.z !== arg.block.location.z) {
            return;
        }

        for (const b of corner0.blocksBetween(corner1)) {
            arg.dimension.getBlock(b).setType(MinecraftBlockTypes.air);
        }
    }
})
