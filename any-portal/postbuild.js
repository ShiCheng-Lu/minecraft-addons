const fse = require('fs-extra');

const packName = process.env.npm_package_name

function findGameFolder() {
    const root = "C:/Users"
    const game = "AppData/Local/Packages/Microsoft.MinecraftUWP_8wekyb3d8bbwe/LocalState/games/com.mojang"

    for (user of fse.readdirSync(root)) {
        const path = `${root}/${user}/${game}`
        if (fse.existsSync(path)) {
            return path;
        }
    }
}

const gameDataFolder = findGameFolder()
const behaviourDest = `${gameDataFolder}/development_behavior_packs/${packName}`
fse.rmSync(behaviourDest, { recursive: true, force: true })
fse.copySync("behavior_pack", behaviourDest, { filter: (src, _) => !src.match(/behavior_pack.src/) })

const resourceDest = `${gameDataFolder}/development_resource_packs/${packName}`
fse.rmSync(resourceDest, { recursive: true, force: true })
fse.copySync("resource_pack", resourceDest)
