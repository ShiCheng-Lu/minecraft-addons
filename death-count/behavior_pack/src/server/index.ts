
import { world } from "@minecraft/server"

world.afterEvents.entityDie.subscribe((e) => {
    if (e.deadEntity.typeId == "minecraft:player") {
        console.warn(`${e.damageSource.cause}, ${e.damageSource.damagingEntity?.typeId}, ${e.damageSource.damagingProjectile?.id}`)
    }
})

// world.afterEvents.entityHurt.subscribe((e) => {
//     e.damageSource.
// })
