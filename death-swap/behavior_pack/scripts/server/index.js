import { world, system } from "@minecraft/server";
import * as DeathSwap from "./swap.js";
world.beforeEvents.chatSend.subscribe(handleCustomCommand);
function handleCustomCommand(arg) {
    if (!arg.message.startsWith('.'))
        return;
    const cmd_args = arg.message.split(' ');
    console.warn(JSON.stringify(cmd_args));
    switch (cmd_args[0]) {
        case ".start": {
            let options;
            try {
                options = Object.assign(DeathSwap.default_option, {
                    grace_period: parseInt(cmd_args[1]),
                    avg_swap_time: parseInt(cmd_args[2]),
                    cx: parseInt(cmd_args[3]),
                    cz: parseInt(cmd_args[4]),
                    dist: parseInt(cmd_args[5]),
                    range: parseInt(cmd_args[6]),
                });
            }
            catch (e) {
                console.warn(e);
            }
            console.warn(`OPTIONS ${options.grace_period}`);
            system.run(() => DeathSwap.start(options));
            break;
        }
        case ".startfunky": {
            let options;
            try {
                options = Object.assign(DeathSwap.default_funky, {
                    grace_period: parseInt(cmd_args[1]),
                    avg_swap_time: parseInt(cmd_args[2]),
                    cx: parseInt(cmd_args[3]),
                    cz: parseInt(cmd_args[4]),
                    dist: parseInt(cmd_args[5]),
                    range: parseInt(cmd_args[6]),
                });
            }
            catch (e) {
                console.warn(e);
            }
            system.run(() => DeathSwap.start(options));
            break;
        }
        case ".help": {
            arg.message = (`\nstart` +
                `\nstart [grace period] [average time] [x] [y] [dist] [range]`);
            return;
        }
    }
    arg.cancel = true;
}
