// import { Dimension, MinecraftBlockTypes, Vector, Vector3, world } from "@minecraft/server";
// import { searchBlock } from "./index"

// function findFrame(loc: Vector3, dir: number, dim: Dimension) {
//     var corner0, corner1;

//     for (let i = 0; i < 5; ++i) {
//         locDeltas[dir](loc);
//         loc = searchBlock(loc, locDeltas[dir], (loc: BlockLocation) => {
//             const b = dim.getBlock(loc);
//             return (
//                 (b.type === MinecraftBlockTypes.endPortalFrame) &&
//                 (b.permutation.getProperty("end_portal_eye_bit") as BoolBlockProperty).value &&
//                 ((b.permutation.getProperty("direction") as IntBlockProperty).value === dir)
//             )
//         });
//         if (dir === 1 && !corner0) {
//             corner0 = new Vector(loc.x - 1, loc.y, loc.z - 1);
//         }
//         if (dir === 3 && !corner1) {
//             corner1 = new Vector(loc.x + 1, loc.y, loc.z + 1);
//         }
//         if (dir === 3) {
//             dir = -1;
//         }
//         dir++;
//     }
//     return [corner0, corner1];
// }

// const locDeltas = [
//     (l: Vector3) => l.x++,
//     (l: Vector3) => l.z++,
//     (l: Vector3) => l.x--,
//     (l: Vector3) => l.z--,
// ]

// world.afterEvents.itemUseOn.subscribe((arg) => {
//     const dim = arg.source.dimension;
//     const block = arg.block
//     if (block.type === MinecraftBlockTypes.endPortalFrame 
//         && arg.itemStack.typeId == "minecraft:ender_eye" && !arg.source.isSneaking) {

//         const dir = block.permutation.getState("direction") as number;
//         const loc = block.location;

//         const [corner0, corner1] = findFrame(loc, dir, dim);
//         if (corner0 === undefined || corner1 === undefined) {
//             return;
//         }
//         if (corner0.x < corner1.x || corner0.z < corner1.z ||
//             loc.x !== block.location.x || loc.z !== block.location.z) {
//             return;
//         }

//         for (const b of corner0.blocksBetween(corner1)) {
//             dim.getBlock(b).setType(MinecraftBlockTypes.endPortal);
//         }

//         arg.source.runCommandAsync(`playsound block.end_portal.spawn @a ${loc.x} ${loc.y} ${loc.z}`);
//     }
// })

// world.afterEvents.blockBreak.subscribe((arg) => {
//     if (arg.brokenBlockPermutation.getState("end_portal_eye_bit")) {

//         const dir = arg.brokenBlockPermutation.getState("direction") as number;
//         const loc = arg.block.location;

//         const [corner0, corner1] = findFrame(loc, dir, arg.dimension);
//         if (corner0 === undefined || corner1 === undefined) {
//             return;
//         }
//         if (corner0.x < corner1.x || corner0.z < corner1.z ||
//             loc.x !== arg.block.location.x || loc.z !== arg.block.location.z) {
//             return;
//         }

//         for (const b of corner0.blocksBetween(corner1)) {
//             arg.dimension.getBlock(b).setType(MinecraftBlockTypes.air);
//         }
//     }
// })
