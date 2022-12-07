import { BlockLocation } from "@minecraft/server";
import "./end";
import "./nether";

export function searchBlock(
    start: BlockLocation,
    iter: (arg: BlockLocation) => void,
    cond: (arg: BlockLocation) => boolean) {

    while (cond(start)) {
        iter(start);
    }
    return start;
}