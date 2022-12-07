import { MBCPlayer } from "mbcore-gametest";
import { EntityQueryOptions, Player, world } from "mojang-minecraft";

world.events.tick.subscribe((arg) => {
    for (const player of world.getPlayers()) {
        const mcbplayer = MBCPlayer.get(player.nameTag);
        if (player.isSneaking) {
            const vectors = mcbplayer.getDirectionVectors();

            





        }
    }
})
