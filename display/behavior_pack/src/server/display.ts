import { Dimension, Location, Vector, world } from "@minecraft/server"

function runUnsafeCommand(cmd: string, dim: Dimension) {
    try {
        dim.runCommandAsync(cmd);
    } catch (e) { console.warn(`failed to run in ${dim}: ${cmd}`); }
}

// NOTE: go with rgb 6 bit encoding, which can support 4 pixel per scoreboard entry, 4 pixel per entity to reduce lag.
const n4offset = Math.pow(64, 0);
const n3offset = Math.pow(64, 1);
const n2offset = Math.pow(64, 2);
const n1offset = Math.pow(64, 3);

export function rgb(r: number, g: number, b: number): number {
    return r * 16 + g * 4 + b;
}

export function encodeInt32(n1: number, n2: number, n3: number, n4: number) {
    return n1 * n1offset + n2 * n2offset + n3 * n3offset + n4 * n4offset;
}

export class Display {
    data: number[][];
    size: Vector;

    // size x, y must be multiples of 2
    constructor(size: Vector, location: Location) {
        this.destroy();

        this.size = new Vector(size.x, size.y, size.z);
        this.data = new Array(size.x).fill(0).map(() => new Array(size.y).fill(0));

        const overworld = world.getDimension('overworld');

        const spawnLoc = location;

        const rgbData = world.scoreboard.addObjective("rgb", "rgb")
        world.scoreboard.setObjectiveAtDisplaySlot("belowname", { objective: rgbData })

        for (let x = 0; x < size.x; ++x) {
            for (let y = 0; y < size.y; ++y) {
                const loc = new Location(x * 0.2 + location.z, 2 + location.y, y * 0.2 + location.z)

                const e = overworld.spawnEntity("display:pixel", spawnLoc);

                e.addTag(`x${x}`);
                e.addTag(`y${y}`);
                e.teleport(loc, overworld, 0, 0);
            }
        }
        console.warn(`created display ${location.toString()}`);
    }

    set(data: number[][]) {
        for (let x = 0; x < this.size.x; ++x) {
            for (let y = 0; y < this.size.y; ++y) {
                this.setPixel(x, y, data[x][y]);
            }
        }
    }

    setPixel(x: number, y: number, value: number) {
        if (this.data[x][y] != value) {
            const dim = world.getDimension("overworld");
            runUnsafeCommand(`scoreboard players set @e[type=display:pixel,tag=x${x},tag=y${y}] rgb ${value}`, dim);
            this.data[x][y] = value;
        }
    }

    clear() {
        for (let x = 0; x < this.size.x; ++x) {
            for (let y = 0; y < this.size.y; ++y) {
                this.setPixel(x, y, 0);
            }
        }
    }

    destroy() {
        const overworld = world.getDimension('overworld');

        runUnsafeCommand(`kill @e[type=display:pixel]`, overworld);
        runUnsafeCommand(`scoreboard objectives remove rgb`, overworld);
    }
}
