import { Vector3 } from "@minecraft/server";
import "./end";
import "./nether";

// common
export function searchBlock(
    start: Vector3,
    iter: (arg: Vector3) => void,
    cond: (arg: Vector3) => boolean) {

    while (cond(start)) {
        iter(start);
    }
    return start;
}

export function vectorEquals(a: any, b: any) {
    return a.x == b.x && a.y == b.y && a.z == b.z
}