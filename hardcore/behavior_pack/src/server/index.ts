import { EntityHurtEvent, Player, world, EntityHealthComponent } from "@minecraft/server"

world.events.entityHurt.subscribe((arg: EntityHurtEvent) => {
    if (arg.hurtEntity instanceof Player) {
        const player = arg.hurtEntity;
        const health = player.getComponent("health") as EntityHealthComponent

        if (health.current <= 0) { // player is dead
            player.runCommandAsync(`gamemode spectator`)
            player.setOp(false)
        }
    }
})
