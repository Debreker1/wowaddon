import * as cheerio from "cheerio";
import fetch, { Response } from "node-fetch";
import * as program from "commander";
import * as fs from "fs-extra";
import * as unzipper from "unzipper";
const currentdir: string = __dirname;
const dirLocationFile = currentdir + '/.wowdir';
const addonList = currentdir + '/.addons.json'
const baseLink: string = "https://www.curseforge.com/wow/addons";
const addons = [];

const setWowDir = (location: string) => {
    fs.writeFile(dirLocationFile, location, (err) => {
        if (err) throw err;
        console.log(`WoW directory set to: ${location}`);
    });
}


const addAddon = async (addonName: string) => {
    if(!fs.existsSync(dirLocationFile)) {
        console.log("No WoW directory set. You can set a WoW directory by using the wowdir command");
        process.exit();
    }
    try {
        const response: Response = await fetch(`${baseLink}/${addonName}/files`);
        const body: string = await response.text();
        const $: CheerioStatic = cheerio.load(body);
        const latestRelease: Cheerio = $(".project-file-listing tbody span.file-phase--release").first().parent().parent();
        const projectInfoRaw: string = $(latestRelease).find("a").attr("data-action-value");
        const projectInfo = JSON.parse(projectInfoRaw);
        const version = projectInfo.FileName;
        const releaseDate = $(latestRelease).find("abbr.tip.standard-date.standard-datetime").attr("data-epoch");
        const addon = {
            "name": addonName,
            version,
            releaseDate,
            "fileId": projectInfo.ProjectFileID
        };
        if (await downloadAddon(addon.name, addon.fileId)) {
            addons.push(addon);
            await fs.writeJson(`${currentdir}/.addons.json`, addons);
            console.log(`added addon: ${addon.name} using version ${addon.version}`);
        }
    } catch (error) {
        throw error;
    }
}

const downloadAddon = async (addonName, fileId) : Promise<boolean> => {
    try {
        const addonDir = `${getWoWLocation()}/Interface/AddOns/`;
        console.log(`downloading ${addonName} (${fileId})`);
        const fileFetch = await fetch(`${baseLink}/${addonName}/download/${fileId}/file`);
        console.log("unzipping files to addon folder...");
        await fileFetch.body.pipe(unzipper.Extract({path: addonDir}));
        return true;
    } catch (error) {
        throw error;
    }
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