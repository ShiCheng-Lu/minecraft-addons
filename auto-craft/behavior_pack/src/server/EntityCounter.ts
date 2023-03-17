import { BlockLocation, Dimension, Entity, EntityHealthComponent, MinecraftEntityTypes } from "@minecraft/server";

export class EntityCounter {
    private dimension: Dimension
    private location: BlockLocation
    private data: { [key: string]: number } = {};

    constructor(dimension: Dimension, location: BlockLocation) {
        this.dimension = dimension;
        this.location = location;
    }

    private isAlive(entity: Entity) {
        return (entity.getComponent("health") as EntityHealthComponent).current > 0
    }

    /**
     * tick
     */
    public tick() {
        const entities = this.dimension.getEntitiesAtBlockLocation(this.location);

        for (const entity of entities) {
            if (this.data[entity.typeId] === undefined) {
                this.data[entity.typeId] = 0;
            }
            if (entity.typeId === "minecraft:item") {
                console.warn(entity.nameTag);
                this.data[entity.typeId]++;
            } else if (this.isAlive(entity)) {
                this.data[entity.typeId]++;
            }
            entity.kill();
        }
    }

    public log() {
        for (const key in this.data) {
            console.warn(`removed ${key}: ${this.data[key]}`)
        }
        console.warn()
    }
}