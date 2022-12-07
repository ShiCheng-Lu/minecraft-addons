const { execSync } = require("child_process")

function main() {
    const option = process.argv[2]
    const project = process.argv[3]

    console.log("hello")

    if (project === undefined || !["build", "package"].includes(option)) {
        console.log(`
Usage:
    npm run <build|package> <project> [log]
`)
        return;
    }

    var result = execSync(`cd ${project} & npm run ${option}`);
    if (process.argv[4] == "log") {
        console.log(result.toString())
    }
}

main();
