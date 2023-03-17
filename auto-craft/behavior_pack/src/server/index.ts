import { BeforeChatEvent, Location, EntityInventoryComponent, ItemStack, MinecraftItemTypes, Player, world, Entity } from "@minecraft/server";
import { EntityCounter } from "./EntityCounter";

const counters: EntityCounter[] = []

world.events.beforeChat.subscribe((arg: BeforeChatEvent) => {
    if (!arg.message.startsWith(".")) return;

    const cmd = arg.message.substring(1);

    switch (cmd) {
        case "start":
            setupItemCounter(arg.sender)
            break;
        case "log":
            logCount()
            break;
        case "init":
            break;
        default:
            break;
    }
})

world.events.tick.subscribe(() => {
    for (const counter of counters) {
        counter.tick()
    }
})

const itemCounterTypeId = "farm:item_counter"

function setupItemCounter(player: Player) {
    player.runCommandAsync(`give @s ${itemCounterTypeId}`)

    const f = world.events.itemUseOn.subscribe((arg) => {
        if (arg.item.typeId === itemCounterTypeId) {
            counters.push(new EntityCounter(arg.source.dimension, arg.blockLocation))
            world.events.itemUseOn.unsubscribe(f);
        }
    });
}

function logCount() {
    for (const counter of counters) {
        counter.log();
    }
}