import { Player, world } from "@minecraft/server";
world.events.entityHurt.subscribe((arg) => {
    if (arg.hurtEntity instanceof Player) {
        const player = arg.hurtEntity;
        const health = player.getComponent("health");
        if (health.current <= 0) {
            player.runCommandAsync(`gamemode spectator`);
            player.setOp(false);
        }
    }
});
