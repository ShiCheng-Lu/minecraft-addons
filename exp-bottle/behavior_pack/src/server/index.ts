import { Player, world, system } from "@minecraft/server";

let total_xp_stored = 0;

world.beforeEvents.itemUse.subscribe(async arg => {
    if (arg.itemStack.typeId !== "minecraft:experience_bottle" || !(arg.source instanceof Player)) {
        return;
    }
    arg.cancel = true;

    const player = arg.source

    system.run(() => {
        if (!player.isSneaking) {
            if (total_xp_stored > 0) {
                player.addExperience(1);
                total_xp_stored -= 1;
            }
            return;
        }

        if (player.xpEarnedAtCurrentLevel < 1) {
            if (player.level == 0) return; // already at minimum level and xp
            player.addLevels(-1);
            player.addExperience(player.totalXpNeededForNextLevel - 1);
            total_xp_stored += 1;
        } else {
            player.addExperience(-1);
            total_xp_stored += 1;
        }
    })
})
