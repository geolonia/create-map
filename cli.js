#!/usr/bin/env node
const meow = require("meow");
const createGeoloniaMap = require("./create-geolonia-map");
const child_process = require("child_process");
const chalk = require("chalk");
const templateSummary = require("./templates/data.json");

const cli = meow(
  `Usage
    $ create-map <map name>
Options
  --version, -v  Show version.
  --help, -h     Show help.
  --template, -t Select template. The default is basic.`,
  {
    flags: {
      template: {
        type: "string",
        alias: "t",
        default: "basic",
      },
    },
  }
);

const main = async () => {
  const [name] = cli.input;
  const options = cli.flags;

  if (options.h || options.help) {
    cli.showHelp();
  } else if (options.v || options.version) {
    cli.showVersion();
  } else {
    process.stdout.write("@geolonia/create-map is curerntly experimental.\n\n");
    process.stdout.write(
      `Creating a new Geolonia Map in ${chalk.green(
        process.cwd() + "/" + name
      )}.\n\n`
    );

    let path;
    try {
      path = await createGeoloniaMap(process.cwd(), name, options);
    } catch (error) {
      process.stderr.write(error.toString());
      process.stderr.write("\n");
      process.exit(1);
    }

    child_process.exec(`cd ${path} && npm install`, (error, _1, stderr) => {
      if (error) {
        process.stderr.write(stderr);
        process.stderr.write("\n");
        process.exit(2);
      } else {
        const data = templateSummary[options.template];
        const commandList = data.commands
          .map(
            ({ value, description }) =>
              `  ${chalk.cyan(value)}\n    ${description}\n`
          )
          .join("\n");
        const starter = data.commands.find(({ isStarter }) => isStarter);
        const suggestion = starter
          ? `We suggest that you begin by typing:

  ${chalk.cyan("cd")} ${name}
  ${chalk.cyan(starter.value)}`
          : "";

        process.stdout.write(`Success! Created hoge at ${path}

Inside that directory, you can run a command:

${commandList}

${suggestion}

Enjoy Geolonia Map!\n`);
        process.exit(0);
      }
    });
  }
};

main();
