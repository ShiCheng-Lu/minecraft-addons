const { execSync } = require("child_process")
const fse = require("fs-extra")

function newProject(name) {
    if (existsSync(name)) {
        return console.log("project already exist")
    }
    // copy default packs from bedrock-samples
    fse.copySync("bedrock-samples/behavior_pack", `${name}/behavior_pack`)
    fse.copySync("bedrock-samples/resource_pack", `${name}/resource_pack`)
    // copy setup
    fse.copySync("template", `${name}`)
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
