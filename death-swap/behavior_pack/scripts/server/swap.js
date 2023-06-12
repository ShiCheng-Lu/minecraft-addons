import { world, system, MinecraftEffectTypes, Vector } from "@minecraft/server";
let started = false;
let live_players;
let grace_period;
export const default_option = {
    grace_period: 20 * 60 * 3,
    avg_swap_time: 20 * 60 * 5,
    cx: 0,
    cz: 0,
    dist: 200,
    range: 1000,
    swapFunction: swap
};
export const default_funky = {
    grace_period: 20 * 10,
    avg_swap_time: 20 * 60 * 1,
    cx: 0,
    cz: 0,
    dist: 200,
    range: 1000,
    swapFunction: funkySwap
};
let options = {
    grace_period: 20 * 60 * 3,
    avg_swap_time: 20 * 60 * 5,
    cx: 0,
    cz: 0,
    dist: 200,
    range: 1000,
    swapFunction: swap
};
let swapFunction;
let runId;
export function start(given_options) {
    options = given_options;
    swapFunction = options.swapFunction ?? swap;
    const players = world.getAllPlayers();
    world.getDimension("overworld").runCommand(`spreadplayers ${options.cx} ${options.cz} ${options.dist} ${options.range} @a[m=s]`);
    live_players = players.map(p => p.name);
    console.warn(live_players.join(", "));
    players.forEach(player => {
        player.addEffect(MinecraftEffectTypes.resistance, 10 * 20, { amplifier: 5, showParticles: false });
    });
    if (runId !== undefined) {
        system.clearRun(runId);
    }
    runId = system.runInterval(update);
    grace_period = options.grace_period + 200;
}
export function swap() {
    const players = world.getAllPlayers().filter(p => live_players.includes(p.name));
    console.warn(`${players.length}`);
    shuffle(players);
    const locations = [];
    const dimensions = [];
    const rotation = [];
    players.forEach((player, index) => {
        locations[index] = player.location;
        rotation[index] = Vector.add(player.location, player.getViewDirection());
        dimensions[index] = player.dimension;
    });
    for (let i = 0; i < live_players.length - 1; ++i) {
        players[i].teleport(locations[i + 1], {
            dimension: dimensions[i + 1],
            facingLocation: rotation[i + 1]
        });
    }
    players[live_players.length - 1].teleport(locations[0], {
        dimension: dimensions[0],
        facingLocation: rotation[0]
    });
}
export function funkySwap() {
    const players = world.getAllPlayers().filter(p => live_players.includes(p.name));
    const p1 = players[Math.floor(Math.random() * live_players.length)];
    const p2 = players[Math.floor(Math.random() * live_players.length)];
    const l1 = p1.location;
    const l2 = p2.location;
    const d1 = p1.dimension;
    const d2 = p2.dimension;
    const r1 = Vector.add(l1, p1.getViewDirection());
    const r2 = Vector.add(l2, p2.getViewDirection());
    p1.teleport(l2, {
        dimension: d2,
        facingLocation: r2,
    });
    p2.teleport(l1, {
        dimension: d1,
        facingLocation: r1,
    });
}
export function shuffle(a) {
    let j, x;
    for (let i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}
export function update() {
    const players = world.getAllPlayers().filter(p => live_players.includes(p.name));
    const deads = players.filter(player => player.getComponent('health').value <= 0)
        .map((p) => p.nameTag);
    const names = deads.join(", ");
    if (deads.length > 0) {
        live_players = players.filter(player => {
            if (deads.includes(player.nameTag)) {
                return false;
            }
            player.onScreenDisplay.setTitle(`${names} ate shit`, { fadeInSeconds: 0.5, fadeOutSeconds: 0.5, staySeconds: 2 });
            return true;
        }).map(p => p.name);
    }
    if (grace_period > 0) {
        console.warn(`${grace_period}`);
        grace_period--;
        return;
    }
    if (Math.random() < 1 / options.avg_swap_time) {
        console.warn(`SWAP`);
        swap();
        grace_period = options.grace_period;
    }
}
export function end() {
    system.clearRun(runId);
    started = false;
}
export * as DeathSwap from "./swap.js";
