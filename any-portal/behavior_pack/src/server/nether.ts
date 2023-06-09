import { Dimension, ItemUseOnAfterEvent, ItemUseOnBeforeEvent, MinecraftBlockTypes, Vector, Vector3, world } from "@minecraft/server";
import { searchBlock, vectorEquals } from "./index";


function getFrame(loc: Vector3, dir: number[], dim: Dimension) {

    loc.x += dir[0];
    loc.z += dir[1];

    searchBlock(loc, (l) => {
        l.x += dir[0]; l.z += dir[1];
    }, (loc) => dim.getBlock(loc)?.type === MinecraftBlockTypes.obsidian);
    loc.x -= dir[0]; loc.z -= dir[1];
    const c0 = new Vector(loc.x, loc.y, loc.z);

    searchBlock(loc, (l) => l.y++,
        (loc) => dim.getBlock(loc)?.type === MinecraftBlockTypes.obsidian
    );
    loc.y--;

    searchBlock(loc, (l) => {
        l.x -= dir[0]; l.z -= dir[1];
    }, (loc) => dim.getBlock(loc)?.type === MinecraftBlockTypes.obsidian);
    loc.x += dir[0]; loc.z += dir[1];
    const c1 = new Vector(loc.x, loc.y, loc.z);

    searchBlock(loc, (l) => l.y--,
        (loc) => dim.getBlock(loc)?.type === MinecraftBlockTypes.obsidian
    );
    loc.y++;

    searchBlock(loc, (l) => {
        l.x += dir[0]; l.z += dir[1];
    }, (loc) => dim.getBlock(loc)?.type === MinecraftBlockTypes.obsidian);
    loc.x -= dir[0]; loc.z -= dir[1];

    if (!vectorEquals(c0, loc) || vectorEquals(c0, c1)) {
        return [undefined, undefined];
    }

    return [c0, c1];
}

function notVanillaPortal(a: Vector, b: Vector) {
    const height = Math.abs(a.y - b.y) + 1;
    if (height < 5 || height > 23) return true;
    const width = Math.abs(a.x - b.x) + Math.abs(a.z - b.z) + 1;
    if (width < 4 || width > 23) return true;

    return false;
}


world.beforeEvents.itemUseOn.subscribe((arg: ItemUseOnBeforeEvent) => {
    if (arg.itemStack.typeId == "minecraft:flint_and_steel" &&
        arg.block.type === MinecraftBlockTypes.obsidian) {

        const dim = arg.source.dimension;

        for (const dir of [[0, 1], [1, 0]]) {
            const [a, b] = getFrame(arg.block.location, dir, dim);
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
