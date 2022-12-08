import { Player, world } from "@minecraft/server";

function xpForLevel(level: number): number {
    if (level <= 15) {
        return 2 * level + 7;
    } else if (level <= 30) {
        return 5 * level - 38
    } else {
        return 9 * level - 158
    }
}

world.events.beforeChat.subscribe(arg => {
    if (!arg.message.startsWith(".")) return;

    const code = arg.message.slice(1);

    arg.sender.runCommandAsync(`xp ${xpForLevel(parseInt(code))}`);
})

async function reduceXP(player: Player, reduceBy: number) {
    let level = await player.runCommandAsync(`xp 0`);

    player.runCommandAsync(`say level is ${JSON.stringify(level)}`);



    // do {
    //     reduceBy++;
    // } while (player.runCommand(`xp 1`).level === level);

    // while (reduceBy > 0) {
    //     level = player.runCommand(`xp -1L`).level;
    //     reduceBy -= xpForLevel(level)
    // }

    // level = player.runCommand(`xp ${-reduceBy}`);
    // return [level, reduceBy];
}

var level = 0;
var xp = 0;

world.events.beforeItemUse.subscribe(async arg => {
    if (arg.item.typeId !== "minecraft:experience_bottle" || !(arg.source instanceof Player)) {
        return;
    }
    // arg.source.
    arg.cancel = true;

    const player = arg.source
    // const level = arg.source.runCommand(`xp 0`).level;
    // var level = player.getDynamicProperty("level") as number;
    // var xp = player.getDynamicProperty("xp") as number;

    if (player.isSneaking) {
        if (xp == 0) {
            if (level == 0) return; // no more xp to take away
            level--;
            xp = xpForLevel(level) - 1;

            await player.runCommandAsync(`xp -1L`);
            await player.runCommandAsync(`xp ${xp}`);
        } else {
            await player.runCommandAsync(`xp ${xpForLevel(level) - xp}`)
            await player.runCommandAsync(`xp -1L`);
            await player.runCommandAsync(`xp ${xp - 1}`)
            
            xp--;
        }
    } else {
        await player.runCommandAsync(`xp 1`);
        // arg.source.runCommand(`xp ${Math.ceil(level / 5)}`);
        xp++;
        if (xp == xpForLevel(level)) {
            level++;
            xp = 0;
        }
    }
})
