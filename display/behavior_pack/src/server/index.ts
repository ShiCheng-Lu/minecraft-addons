import { Vector2, Vector3 } from "gametest-maths";
import { world } from "mojang-minecraft"
import { Display } from "./display";

function color(r: number, g: number, b: number): number {
    return r * 16 + g * 4 + b;
}

let display: Display;

world.events.beforeChat.subscribe((arg) => {
    if (arg.message.startsWith("start")) {
        const cmd = arg.message.split(' ').map((x) => parseInt(x));
        display = new Display(new Vector2(cmd[1], cmd[2]), new Vector3(arg.sender.location));
    } else if (arg.message.startsWith("setpixel")) {
        const cmd = arg.message.split(' ').map((x) => parseInt(x));
        display.setPixel(cmd[1], cmd[2], color(cmd[3], cmd[4], cmd[5]));
    } else if (arg.message.startsWith("test")) {
        const res = arg.sender.runCommand("scoreboard players list @e");
        console.warn(JSON.stringify(res));
    }
});

