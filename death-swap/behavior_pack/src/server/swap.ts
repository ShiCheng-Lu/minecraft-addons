import { world, MinecraftEffectTypes, Player, EntityHealthComponent, Vector3, XYRotation, Dimension } from "@minecraft/server";

let started: boolean = false;
let live_players: Player[];
let grace_period: number;

type DeathSwapOptions = {
    grace_period: number
    avg_swap_time: number
    cx: number // x center
    cz: number // z center
    dist: number
    range: number
    swapFunction: () => void
}

export const default_option: DeathSwapOptions = {
    grace_period: 20 * 60 * 3,
    avg_swap_time: 20 * 60 * 5,
    cx: 0,
    cz: 0,
    dist: 200,
    range: 1000,
    swapFunction: swap
}

export const default_funky: DeathSwapOptions = {
    grace_period: 20 * 10,
    avg_swap_time: 20 * 60 * 1,
    cx: 0,
    cz: 0,
    dist: 200,
    range: 1000,
    swapFunction: funkySwap
}

let options: DeathSwapOptions;
let swapFunction: () => void;

export async function start(given_options?: Partial<DeathSwapOptions>) {
    swapFunction = given_options?.swapFunction ?? swap

    const players = world.getAllPlayers();
    if (started) return players.forEach(player => {
        player.runCommandAsync("say @s game already started")
    });

    options = Object.assign(options, default_option, given_options);
    console.warn("started game");

    const res = await world.getDimension("overworld").runCommandAsync(`spreadplayers ${options.cx} ${options.cz} ${options.dist} ${options.range} @a[m=s]`)

    live_players = players;
    console.warn(JSON.stringify(live_players));

    players.forEach(player => {
        player.addEffect(MinecraftEffectTypes.resistance, 10, 10, false);
    })
    
    world.events.tick.subscribe(update);
    
    grace_period = options.grace_period + 200;
}

export function swap() {
    shuffle(live_players);
    console.warn(JSON.stringify(live_players));

    const locations: Vector3[] = []
    const dimensions: Dimension[] = []
    const rotation: XYRotation[] = []

    live_players.forEach((player, index) => {
        locations[index] = player.location
        rotation[index] = player.rotation
        dimensions[index] = player.dimension
    });
    // tp players to helpers
    for (let i = 0; i < live_players.length - 1; ++i) {
        live_players[i].teleport(locations[i + 1], dimensions[i + 1], rotation[i + 1].x, rotation[i + 1].y)
    }
}

export function funkySwap() {
    const OVERWORLD = world.getDimension("overworld");
    // select random pair of players
    const p1 = live_players[Math.floor(Math.random() * live_players.length)];
    const p2 = live_players[Math.floor(Math.random() * live_players.length)];

    const l1 = p1.location
    const l2 = p2.location
    const d1 = p1.dimension
    const d2 = p2.dimension
    const r1 = p1.rotation
    const r2 = p2.rotation

    p1.teleport(l2, d2, r2.x, r2.y)
    p2.teleport(l1, d1, r1.x, r1.y)
}


export function shuffle(a: Player[]) {
    let j: number, x: Player;
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
    const deads = world.getAllPlayers()
        .filter((p) => live_players.includes(p) && (p.getComponent('health') as EntityHealthComponent).value <= 0)
        .map((p) => p.nameTag);

    const names = deads.join(", ")
    if (deads.length > 0) {
        // display deads names?
        live_players = live_players.filter(player => {
            if (deads.includes(player.name)) {
                return false;
            }
            player.onScreenDisplay.setTitle(`${names} ate shit`, { fadeInSeconds: 0.5, fadeOutSeconds: 0.5, staySeconds: 2 })
            return true;
        })
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
    world.events.tick.unsubscribe(update);
}


export * as DeathSwap from "./swap.js"