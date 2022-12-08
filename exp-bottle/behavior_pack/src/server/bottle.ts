import { Entity, world } from "@minecraft/server";

function xpForLevel(level: number): number {
    if (level <= 15) {
        return 2 * level + 7;
    } else if (level <= 30) {
        return 5 * level - 38
    } else {
        return 9 * level - 158
    }
}

function reduceXP(entity: Entity, reduceBy: number): [number, number] {
    let level = entity.runCommand(`xp 0`).level;

    do {
        reduceBy++;
    } while (entity.runCommand(`xp 1`).level === level);

    while (reduceBy > 0) {
        level = entity.runCommand(`xp -1L`).level;
        reduceBy -= xpForLevel(level)
    }

    level = entity.runCommand(`xp ${-reduceBy}`);
    return [level, reduceBy];
}

world.events.beforeItemUse.subscribe((arg) => {
    if (arg.item.id !== "minecraft:experience_bottle") {
        return;
    }
    arg.cancel = true;
    const level = arg.source.runCommand(`xp 0`).level;
    if (arg.source.isSneaking) {
        reduceXP(arg.source, Math.ceil(level / 5));
    } else {
        arg.source.runCommand(`xp ${Math.ceil(level / 5)}`);
    }
})
