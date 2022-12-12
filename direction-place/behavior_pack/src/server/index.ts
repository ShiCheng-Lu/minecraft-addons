// import { world, BeforeItemUseOnEvent, Player, Vector, MinecraftItemTypes } from "@minecraft/server"
// import { intersect } from "./helper"

// world.events.beforeItemUseOn.subscribe((arg: BeforeItemUseOnEvent) => {
//     if (!(arg.source instanceof Player) && arg.item.typeId !== MinecraftItemTypes.stick.id) return;

//     const player = arg.source

//     const block = player.getBlockFromViewVector({ maxDistance: 10 })
//     if (block === null) return;

//     const props = block.permutation.getAllProperties();

//     console.warn(props.map(x => x.name).join(" "));

//     // console.warn(`view: ${player.headLocation.x} ${player.headLocation.y} ${player.headLocation.z}`)
    
//     // // player crosshair origin is -0.025 lower than headLocation while crouching
//     // //                            +0.1   higher                  while standing
//     // const origin = new Vector(player.headLocation.x, player.headLocation.y - 0.025, player.headLocation.z)
//     // const [face, x, y] = intersect(origin, player.viewVector, block.location)

//     // console.warn(`game: ${arg.blockFace}, ${arg.faceLocationX}, ${arg.faceLocationY}`)
//     // console.warn(`calc: ${face}, ${x}, ${y}`)
// })

import "./placer"
