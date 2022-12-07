const { execSync } = require("child_process")
const { randomUUID } = require("crypto")
const fse = require("fs-extra")

function newProject(name) {
    // if (fse.existsSync(name)) {
    //     return console.log("project already exist")
    // }
    fse.copySync("template", `${name}`)

    const uuidMap = {
        "{{uuid-behavior}}": randomUUID(),
        "{{uuid-behavior-module}}": randomUUID(),
        "{{uuid-resource}}": randomUUID(),
        "{{uuid-resource-module}}": randomUUID(),
    }

    for (fileName of ["behavior_pack/manifest.json", "resource_pack/manifest.json"]) {
        var file = fse.readFileSync(`${name}/${fileName}`, { encoding: 'utf-8' });
        for (key in uuidMap) {
            file = file.replace(key, uuidMap[key])
        }
        fse.writeFileSync(`${name}/${fileName}`, file, { encoding: 'utf-8' });
    }
}

function main() {
    const option = process.argv[2]
    const project = process.argv[3]

    if (project === undefined || !["build", "package", "new"].includes(option)) {
        console.log(`
Usage:
    npm run <option> <project> [log]

    options: 
        - build     build a project
        - package   package a project
        - new       create a new project
`)
        return;
    }

    if (option === "new") {
        return newProject(project)
    }

    // command fallthrough
    var result = execSync(`cd ${project} & npm run ${option}`);
    if (process.argv[4] == "log") {
        console.log(result.toString())
    }
}

main();
