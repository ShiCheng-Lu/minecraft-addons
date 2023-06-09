
import { world } from "@minecraft/server"

world.afterEvents.entityDie.subscribe((e) => {
    if (e.deadEntity.typeId == "minecraft:player") {
        console.warn(e.damageSource.cause)
    }
})

world.beforeEvents.chatSend.subscribe((e) => {
    console.warn(e.message)
})
