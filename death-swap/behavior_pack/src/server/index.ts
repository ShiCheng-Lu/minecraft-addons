import { BeforeChatEvent, world } from "@minecraft/server"
import * as DeathSwap from "./swap.js"


world.events.beforeChat.subscribe(handleCustomCommand);

function handleCustomCommand(arg: BeforeChatEvent) {
    if (!arg.message.startsWith('.')) return;

    switch (arg.message) {
        case ".start": {
            const cmd_args = arg.message.split(' ');
            console.warn(JSON.stringify(cmd_args));
            let options;
            try {
                options = Object.assign({
                    grace_period: parseInt(cmd_args[1]),
                    avg_swap_time: parseInt(cmd_args[2]),
                    cx: parseInt(cmd_args[3]),
                    cz: parseInt(cmd_args[4]),
                    dist: parseInt(cmd_args[5]),
                    range: parseInt(cmd_args[6]),
                }, DeathSwap.default_option);
            } catch (e) {
                console.warn(e);
            }
            DeathSwap.start(options);
            break;
        }
        case ".startfunky": {
            const cmd_args = arg.message.split(' ');
            console.warn(JSON.stringify(cmd_args));
            let options;
            try {
                options = Object.assign({
                    grace_period: parseInt(cmd_args[1]),
                    avg_swap_time: parseInt(cmd_args[2]),
                    cx: parseInt(cmd_args[3]),
                    cz: parseInt(cmd_args[4]),
                    dist: parseInt(cmd_args[5]),
                    range: parseInt(cmd_args[6]),
                }, DeathSwap.default_funky);
            } catch (e) {
                console.warn(e);
            }
            DeathSwap.start(options);
            break;
        }
        case ".help": {
            arg.message = (
                `\nstartgame` +
                `\nstartgame [grace period] [average time] [x] [y] [dist] [range]`
            )
            return;
        }
    }
    arg.cancel = true;
}
