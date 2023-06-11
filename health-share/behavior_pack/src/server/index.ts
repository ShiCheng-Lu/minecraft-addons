import { EntityHealthComponent, MinecraftEffectTypes, DynamicPropertiesDefinition } from "@minecraft/server";
import { world, system } from "@minecraft/server"

let health = 20;
let max_health = 20;

const HEALTH_INCREASE_SCALE = 1 / Math.log(1.15);
const NATURAL_REGENERATION_TIME = 5 * 20;
const SHARED_HEALTH_PROPERTY = "shared_health"; // datastore to keep track of health, not sure if needed

world.afterEvents.worldInitialize.subscribe((e) => {
    const def = new DynamicPropertiesDefinition();
    def.defineNumber(SHARED_HEALTH_PROPERTY);
    e.propertyRegistry.registerWorldDynamicProperties(def);

    health = world.getDynamicProperty(SHARED_HEALTH_PROPERTY) as number;
})

// set health for all players to targetHealth
function syncHealth(targetHealth: number) {
    health = Math.min(targetHealth, max_health);
    world.setDynamicProperty(SHARED_HEALTH_PROPERTY, health);

    world.getAllPlayers().forEach(player => {
        const healthComponent = player.getComponent(EntityHealthComponent.componentId) as EntityHealthComponent;
        healthComponent.setCurrent(health);
    })
}

// update max health for all players
function updateMaxHealth(amplifier: number) {
    // set all players max hp with health boost
    world.getAllPlayers().forEach(player => {
        player.removeEffect(MinecraftEffectTypes.healthBoost);
        player.addEffect(MinecraftEffectTypes.healthBoost, 20000000, {amplifier: amplifier, showParticles: false});
    })
    // give player some extra hp if max health is increased
    const new_max_health = 24 + 4 * amplifier;
    const boost = Math.max((new_max_health - max_health) / 2, 0)
    max_health = new_max_health;
    syncHealth(health + boost);
}

// natural regen
system.runInterval(() => {
    if (health < max_health) {
        syncHealth(health + 1);
    }
}, NATURAL_REGENERATION_TIME);

world.afterEvents.playerSpawn.subscribe(() => {
    const players = world.getAllPlayers();
    updateMaxHealth(Math.floor(Math.log(players.length) * HEALTH_INCREASE_SCALE - 1));
})

world.afterEvents.playerLeave.subscribe(() => {
    const players = world.getAllPlayers();
    updateMaxHealth(Math.floor(Math.log(players.length) * HEALTH_INCREASE_SCALE - 1));
})

// when one player is hurt, damage all players
world.afterEvents.entityHurt.subscribe((e) => {
    world.getAllPlayers().forEach(player => {
        player.applyDamage(e.damage);
    });

    syncHealth(health - e.damage);
}, { // only trigger for
    entityTypes: ["minecraft:player"]
})

// reset health after players die
world.afterEvents.entityDie.subscribe(() => {
    health = max_health;
}, { // only trigger for
    entityTypes: ["minecraft:player"]
})
