const cheerio = require("cheerio");
const program = require("commander");
const fs = require("fs");
const currentdir = __dirname;
const dirLocationFile = currentdir + '/.wowdir';

const setWowDir = (location) => {
    fs.writeFile(dirLocationFile, location, (err) => {
        if(err) throw err;
        console.log(`WoW directory set to: ${location}`);
    });
}

const addAddon = (link) => {
    const addons = [];
    const addonDir = `${getWoWLocation()}/Interface/AddOns/`;
    console.log(link);
}

const getWoWLocation = () => {
    return fs.readFileSync(dirLocationFile, 'utf8');
}

program
.version("1.0")
.command("wowdir <dir>")
.action((dir) => setWowDir(dir));

program.command("add <link>")
.action((link) => addAddon(link))
program.parse(process.argv);