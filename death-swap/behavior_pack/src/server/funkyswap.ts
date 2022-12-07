import { Commands, TickEvent, World } from "@minecraft/server";

let started: boolean = false;
let live_players: string[];
let grace_period: number;

type DeathSwapOptions = {
    grace_period: number
    avg_swap_time: number
    cx: number // x center
    cz: number // z center
    dist: number
    range: number
}

const defaultOptions: DeathSwapOptions = {
    grace_period: 20 * 10,
    avg_swap_time: 20 * 60 * 1,
    cx: 0,
    cz: 0,
    dist: 200,
    range: 1000,
}

let options: DeathSwapOptions;

// class Repeat {
//     update: (arg: TickEvent) => void;
//     constructor(event: (arg: any) => boolean, context?: any) {
//         this.update = World.events.tick.subscribe((arg: TickEvent) => {
//             if (event(context)) {
//                 World.events.tick.unsubscribe(this.update);
//             }
//         });
//     }
// }

export function start(given_options?: Partial<DeathSwapOptions>) {
    if (started) return Commands.run(`say Game already started`, World.getDimension("overworld"));

    options = Object.assign(options, defaultOptions, given_options);
    console.warn("started game");

    const res = Commands.run(`spreadplayers ${options.cx} ${options.cz} ${options.dist} ${options.range} @a[m=s]`,
        World.getDimension('overworld'));

    live_players = res.victims.split(", ");
    console.warn(JSON.stringify(live_players));

    // console.warn(JSON.stringify(res));
    // // also make sure player doesn't die
    // // Commands.run(``, World.getDimension('overworld'));

    World.events.tick.subscribe(update);
    grace_period = options.grace_period + 200;
}

export function swap() {
    const OVERWORLD = World.getDimension("overworld");
    // setup helper at each location
    const t1 = Math.floor(Math.random() * live_players.length);
    const t2 = Math.floor(Math.random() * live_players.length);

    Commands.run(`execute "${live_players[t1]}" ~~~ summon swap:helper "${live_players[t1]}"`, OVERWORLD);
    Commands.run(`execute "${live_players[t2]}" ~~~ summon swap:helper "${live_players[t2]}"`, OVERWORLD);
    
    Commands.run(`tp "${live_players[t1]}" @e[type=swap:helper,name="${live_players[t2]}"]`, OVERWORLD);
    Commands.run(`tp "${live_players[t2]}" @e[type=swap:helper,name="${live_players[t1]}"]`, OVERWORLD);
    // kill helpers
    Commands.run(`kill @e[type=swap:helper]`, OVERWORLD);
}

export function update() {
    console.warn("updating");
    const deads = World.getPlayers()
        .filter((p) => live_players.includes(p.nameTag) && p.getComponent('health').value <= 0)
        .map((p) => p.nameTag);

    if (deads.length > 0) {
        // display deads names?
        Commands.run(`title @a actionbar ${deads[0]} ate shit`, World.getDimension("overworld"));

        live_players = live_players.filter((p) => !deads.includes(p));
        if (live_players.length <= 0) end();
    }

    if (grace_period > 0) {
        grace_period--;
        return;
    }
    if (Math.random() < 1 / options.avg_swap_time) {
        swap();
        grace_period = options.grace_period;
    }
}

export function end() {
    World.events.tick.unsubscribe(update);

    Commands.run(`kill @e[type=swap:helper]`, World.getDimension("overworld"));
}


export * as FunckySwap from "./swap.js"