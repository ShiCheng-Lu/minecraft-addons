const fse = require('fs-extra');

const packName = process.env.npm_package_name

const gameDataFolder = "C:/Users/shich/AppData/Local/Packages/Microsoft.MinecraftUWP_8wekyb3d8bbwe/LocalState/games/com.mojang"
const behaviourDest = `${gameDataFolder}/development_behavior_packs/${packName}`
fse.rmSync(behaviourDest, { recursive: true, force: true })
fse.copySync("behaviour_pack", behaviourDest, { filter: (src, _) => !src.match(/behaviour_pack.src/) })

const resourceDest = `${gameDataFolder}/development_resource_packs/${packName}`
fse.rmSync(resourceDest, { recursive: true, force: true })
fse.copySync("resource_pack", resourceDest)
