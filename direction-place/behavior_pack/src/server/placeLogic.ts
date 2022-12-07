import { Vector3 } from "gametest-maths";
import {
    BeforeItemUseOnEvent,
    ItemUseOnEvent,
} from "mojang-minecraft";
import { setTickTimeout } from "mbcore-gametest";
import {
  DataSave,
  EventEmitter,
  MBCPlayer,
  MinecraftParticles,
} from "mbcore-gametest";
import { world } from "mojang-minecraft";
import { blocks } from "./blocks";


world.events.itemUseOn.subscribe((arg: ItemUseOnEvent) => {
    if (arg.item.id !== "minecraft:stick") return;

    const a = Vector3;
    const d = DataSave;
    const c = EventEmitter

    const block = arg.source.dimension.getBlock(arg.blockLocation);
    const perms = block.permutation.getAllProperties();
    console.log(block.id);
    perms.forEach((perm) => {
        console.log(perm.name);
    })
})

world.events.beforeItemUseOn.subscribe((arg: BeforeItemUseOnEvent) => {
    if (arg.source.id !== "minecraft:player" || !arg.source.isSneaking) return;
    const a = MBCPlayer.get("yes");
    const data = blocks[arg.item.id];
    if (!data) {
        console.log(arg.item.id);
        return;
    }
    const rotation = get_rotation(arg.faceLocationX, arg.faceLocationY, arg.direction)

    const actorName = arg.source.nameTag;
    // listen for place event
    const placeEvent = world.events.blockPlace.subscribe((arg) => {
        if (arg.player.nameTag === actorName) {
            const perm = arg.block.permutation;
            perm.getProperty("facing_direction").value = data.rotation[rotation];
            arg.block.setPermutation(perm);
        }
    });
    setTickTimeout(() => world.events.blockPlace.unsubscribe(placeEvent), 0);
})

function get_rotation(x: number, y: number, dir: number) {
    if (Math.abs(x - 0.5) < 0.25 && Math.abs(y - 0.5) < 0.25) {
        return dir % 2 === 0 ? dir + 1 : dir - 1;
    } else if (x > y) {
        if (1 - x > y) {
            switch (dir) {
                case 0: return 2;
                case 1: return 2;
                case 2: return 0;
                case 3: return 0;
                case 4: return 2;
                case 5: return 2;
            }
        } else {
            switch (dir) {
                case 0: return 5;
                case 1: return 5;
                case 2: return 5;
                case 3: return 5;
                case 4: return 1;
                case 5: return 1;
            }
        }
    } else {
        if (1 - x < y) {
            switch (dir) {
                case 0: return 3;
                case 1: return 3;
                case 2: return 1;
                case 3: return 1;
                case 4: return 3;
                case 5: return 3;
            }
        } else {
            switch (dir) {
                case 0: return 4;
                case 1: return 4;
                case 2: return 4;
                case 3: return 4;
                case 4: return 0;
                case 5: return 0;
            }
        }
    }
}