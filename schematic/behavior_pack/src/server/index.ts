import { world } from "@minecraft/server";
// import { nbtToJson } from "./nbt_reader";

world.events.beforeChat.subscribe(arg => {
    if (arg.message.startsWith("load")) {
        const file = arg.message.split(' ')[1]

        console.warn(file)


        eval("const s = require('fs')")
        // console.log(file_data)
        // const data = nbtToJson(file_data);
    }
})
