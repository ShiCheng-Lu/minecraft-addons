import { BlockLocation, Dimension, MinecraftBlockTypes, world } from "@minecraft/server";
import { searchBlock } from "./index";


function getFrame(loc: BlockLocation, dir: number[], dim: Dimension) {

    loc.x += dir[0];
    loc.z += dir[1];


    searchBlock(loc, (l) => {
        l.x += dir[0]; l.z += dir[1];
    }, (loc) => dim.getBlock(loc).type === MinecraftBlockTypes.obsidian);
    loc.x -= dir[0]; loc.z -= dir[1];
    const c0 = new BlockLocation(loc.x, loc.y, loc.z);

    searchBlock(loc, (l) => l.y++,
        (loc) => dim.getBlock(loc).type === MinecraftBlockTypes.obsidian
    );
    loc.y--;

    searchBlock(loc, (l) => {
        l.x -= dir[0]; l.z -= dir[1];
    }, (loc) => dim.getBlock(loc).type === MinecraftBlockTypes.obsidian);
    loc.x += dir[0]; loc.z += dir[1];
    const c1 = new BlockLocation(loc.x, loc.y, loc.z);

    searchBlock(loc, (l) => l.y--,
        (loc) => dim.getBlock(loc).type === MinecraftBlockTypes.obsidian
    );
    loc.y++;

    searchBlock(loc, (l) => {
        l.x += dir[0]; l.z += dir[1];
    }, (loc) => dim.getBlock(loc).type === MinecraftBlockTypes.obsidian);
    loc.x -= dir[0]; loc.z -= dir[1];

    if (!c0.equals(loc) || c0.equals(c1)) {
        return [undefined, undefined];
    }

    return [c0, c1];
}

function notVanillaPortal(a: BlockLocation, b: BlockLocation) {
    const height = Math.abs(a.y - b.y) + 1;
    if (height < 5 || height > 23) return true;
    const width = Math.abs(a.x - b.x) + Math.abs(a.z - b.z) + 1;
    if (width < 4 || width > 23) return true;

    return false;
}


world.events.itemUseOn.subscribe((arg) => {
    if (arg.item.typeId == "minecraft:flint_and_steel" &&
        arg.source.dimension.getBlock(arg.blockLocation).type === MinecraftBlockTypes.obsidian) {

        const dim = arg.source.dimension;

        for (const dir of [[0, 1], [1, 0]]) {
            const [a, b] = getFrame(arg.blockLocation, dir, dim);
            // needs to be a fill command
            if (a && b && notVanillaPortal(a, b)) {
                // fill ... portal 0 if x 1 if z
                a.x -= dir[0]; a.z -= dir[1]; a.y++;
                b.x += dir[0]; b.z += dir[1]; b.y--;
                arg.source.runCommandAsync(`fill ${a.x} ${a.y} ${a.z} ${b.x} ${b.y} ${b.z} portal ${dir[0]}`);
            }
        }
    }
})
