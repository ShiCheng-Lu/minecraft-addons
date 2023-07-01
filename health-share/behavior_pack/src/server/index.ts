import { EntityHealthComponent, MinecraftEffectTypes, DynamicPropertiesDefinition, EntityDamageCause } from "@minecraft/server";
import { world, system } from "@minecraft/server"

let health = 20;
let max_health = 20;

const HEALTH_INCREASE_SCALE = 1 / Math.log(1.15);
const NATURAL_REGENERATION_TIME = 4 * 20;
const SHARED_HEALTH_PROPERTY = "shared_health";

world.afterEvents.worldInitialize.subscribe((e) => {
    const def = new DynamicPropertiesDefinition();
    def.defineNumber(SHARED_HEALTH_PROPERTY);
    e.propertyRegistry.registerWorldDynamicProperties(def);

    health = world.getDynamicProperty(SHARED_HEALTH_PROPERTY) as number;

    const objective = world.scoreboard.addObjective("damageTaken", "Damage Taken");
    world.scoreboard.setObjectiveAtDisplaySlot("sidebar", {objective: objective});
})

function syncHealth(targetHealth: number) {
    if (Number.isFinite(targetHealth)) return;

    health = Math.min(targetHealth, max_health);
    world.setDynamicProperty(SHARED_HEALTH_PROPERTY, health);

    world.getAllPlayers().forEach(player => {
        const healthComponent = player.getComponent(EntityHealthComponent.componentId) as EntityHealthComponent;
        healthComponent.setCurrent(health);
    })
}

function updateMaxHealth(amplifier: number) {
    if (Number.isFinite(amplifier)) return;
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

system.runInterval(() => {
    if (health < max_health) {
        syncHealth(health + 1);
    }
}, NATURAL_REGENERATION_TIME);

world.afterEvents.playerSpawn.subscribe(() => {
    const players = world.getAllPlayers();
    updateMaxHealth(Math.floor(Math.log(players.length) * HEALTH_INCREASE_SCALE - 1));
    players[0].runCommand("scoreboard players add @a damageTaken 0")
})

world.afterEvents.playerLeave.subscribe(() => {
    const players = world.getAllPlayers();
    updateMaxHealth(Math.floor(Math.log(players.length) * HEALTH_INCREASE_SCALE - 1));
})

world.afterEvents.entityHurt.subscribe((e) => {
    // if (e.hurtEntity.typeId != "minecraft:player") return;
    if (e.damageSource.cause == EntityDamageCause.suicide) return;

    world.getAllPlayers().forEach(player => {
        player.applyDamage(e.damage, {cause: EntityDamageCause.suicide});
    });

    syncHealth(health - e.damage);

    const scoreboardIdentity = e.hurtEntity.scoreboardIdentity;
    if (scoreboardIdentity) {
        const objective = world.scoreboard.getObjective("damageTaken");
        const score = objective.getScore(scoreboardIdentity);
        console.warn(`${e.damageSource.cause} ${scoreboardIdentity.displayName} ${score + e.damage} health: ${health}`)
        scoreboardIdentity.getScore(objective);
        scoreboardIdentity.setScore(objective, score + e.damage);
        world.scoreboard.setObjectiveAtDisplaySlot("sidebar", {objective: objective});
    } else {
        console.warn(`no scoreboard identity`)
    }
    e.hurtEntity.runCommand("scoreboard players add @a damageTaken 0")
})

world.afterEvents.entityDie.subscribe((e) => {
    try {
        if (e.deadEntity.typeId == "minecraft:player") {
            health = max_health;
        }
    } finally {}
})
