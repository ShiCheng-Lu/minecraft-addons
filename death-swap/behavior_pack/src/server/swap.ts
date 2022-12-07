import { Commands, TickEvent, World } from "mojang-minecraft";

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

export const default_option: DeathSwapOptions = {
    grace_period: 20 * 60 * 3,
    avg_swap_time: 20 * 60 * 5,
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

export function start(given_options: DeathSwapOptions) {
    if (started) return Commands.run(`say Game already started`, World.getDimension("overworld"));

    options = given_options;
    console.warn("started game");

    const res = Commands.run(`spreadplayers ${options.cx} ${options.cz} ${options.dist} ${options.range} @a[m=s]`,
        World.getDimension('overworld'));

    started = true;
    live_players = res.victims.split(", ");
    console.warn(JSON.stringify(live_players));


    // console.warn(JSON.stringify(res));
    // // also make sure player doesn't die
    // // Commands.run(``, World.getDimension('overworld'));
    Commands.run(`effect @a[m=s] resistance 10 10 true`, World.getDimension('overworld'));

    World.events.tick.subscribe(update);
    grace_period = options.grace_period + 200;
}

export function swap() {
    const OVERWORLD = World.getDimension("overworld");
    // setup helper at each location
    live_players.forEach((name) => Commands.run(`execute "${name}" ~~~ summon swap:helper "${name}"`, OVERWORLD));

    shuffle(live_players);
    console.warn(JSON.stringify(live_players));
    // tp players to helpers
    for (let i = 0; i < live_players.length - 1; ++i) {
        Commands.run(`tp "${live_players[i]}" @e[type=swap:helper,name="${live_players[i + 1]}"]`, OVERWORLD);
    }
    Commands.run(`tp "${live_players[live_players.length - 1]}" @e[type=swap:helper,name="${live_players[0]}"]`, OVERWORLD);
    // kill helpers
    Commands.run(`kill @e[type=swap:helper]`, OVERWORLD);
}

export function shuffle(a: string[]) {
    let j: number, x: string;
    // loop through the array and swap with another random member
    for (let i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        // swap pos
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

export function update() {
    const deads = World.getPlayers()
        .filter((p) => live_players.includes(p.nameTag) && p.getComponent('health').value <= 0)
        .map((p) => p.nameTag);

    if (deads.length > 0) {
        // display deads names?
        Commands.run(`title @a actionbar ${deads[0]} ate shit`, World.getDimension("overworld"));

        live_players = live_players.filter((p) => !deads.includes(p));
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
    World.events.tick.unsubscribe(this.update);

    Commands.run(`kill @e[type=swap:helper]`, World.getDimension("overworld"));
}


export * as DeathSwap from "./swap.js"