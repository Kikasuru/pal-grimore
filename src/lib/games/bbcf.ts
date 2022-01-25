import { Color, Palette } from "../palette"

// File format here https://github.com/kovidomi/BBCF-Improvement-Mod/blob/master/src/Palette/impl_format.h

const size = 0x2098;
const header = "IMPLCF\x00\x00";
const palStart = 0x94;
const palSize = 256;

export interface CfplData {
    readonly pal: Palette,
    readonly name: string,
    readonly auth: string,
    readonly desc: string,
    readonly char: number,

    readonly cfpl: ArrayBuffer
}

/**
 * Loads a BBCF CMPL file into a palette.
 * @param {ArrayBuffer} file - The CMPL file in an ArrayBuffer.
 * @returns {CfplData} The data for this file.
 */
export function loadCfpl(file: ArrayBuffer): CfplData {
    const dcdr = new TextDecoder();
    const pal = new Uint8Array(file);

    if (pal.length != size) throw `Incorrect file size! Needs to be ${size}B, is ${pal.length}B.`;
    if (dcdr.decode(pal.subarray(0, 8)) != header) throw "Incorrect header!"

    // Create a new array from the data in the file
    let colors: Color[] = [];
    for (let i = palStart; i < palStart + (palSize * 4); i += 4) {
        colors.push(new Color(pal[i + 3], pal[i + 2], pal[i + 1], pal[i]));
    }

    let name = dcdr.decode(pal.subarray(20, 52)).replaceAll("\x00", "");
    let auth = dcdr.decode(pal.subarray(52, 84)).replaceAll("\x00", "");
    let desc = dcdr.decode(pal.subarray(84, 148)).replaceAll("\x00", "");
    return { pal: new Palette(colors), name, auth, desc, char: pal[0x10], cfpl: file };
}

/** Simplified names for every character that is used in search parameters */
export const characterSearchNames = [
	["0", "ragna", "ra"],
	["1", "jin", "ji"],
	["2", "noel", "no"],
	["3", "rachel", "rc"],
	["4", "taokaka", "tao", "tk"],
	["5", "tager", "irontager", "tg"],
	["6", "litchi", "li"],
	["7", "arakune", "ar"],
	["8", "bang", "bg"],
	["9", "carl", "cr"],
	["10", "hakumen", "hk"],
	["11", "nu13", "nu-13", "nu"],
	["12", "tsubaki", "ts"],
	["13", "hazama", "hz"],
	["14", "mu12", "mu-12", "mu"],
	["15", "makoto", "mk"],
	["16", "valkenhayn", "valk", "vk"],
	["17", "platnium", "plat", "pl"],
	["18", "relius", "re"],
	["19", "izayoi", "iz"],
	["20", "amane", "am"],
	["21", "bullet", "bu"],
	["22", "azrael", "az"],
	["23", "kagura", "kg"],
	["24", "kokonoe", "ko"],
	["25", "terumi", "te"],
	["26", "celicia", "ce"],
	["27", "lambda11", "lambda-11", "lambda", "la"],
	["28", "hibiki", "hi"],
	["29", "nine", "ni"],
	["30", "naoto", "na"],
	["31", "izanami", "in"],
	["32", "susanoo", "susano'o", "susano", "su"],
	["33", "es"],
	["34", "mai", "ma"],
	["35", "jubei", "ju"]
]

/** Full character names */
export const characterFullNames = [
	"Ragna the Bloodedge",
	"Jin Kisaragi",
	"Noel Vermillion",
	"Rachel Alucard",
	"Taokaka",
	"Iron Tager",
	"Litchi Faye Ling",
	"Arakune",
	"Bang Shishigami",
	"Carl Clover",
	"Hakumen",
	"Nu-13",
	"Tsubaki Yayoi",
	"Hazama",
	"Mu-12",
	"Makoto Nanaya",
	"Valkenhayn R. Hellsing",
	"Platinum the Trinity",
	"Relius Clover",
	"Izayoi",
	"Amane Nishiki",
	"Bullet",
	"Azrael",
	"Kagura Mutsuki",
	"Kokonoe",
	"Yuuki Terumi",
	"Celica A. Mercury",
	"Lambda-11",
	"Hibiki Kohaku",
	"Nine the Phantom",
	"Naoto Kurogane",
	"Izanami",
	"Susano'o",
	"Es",
	"Mai Natsume",
	"Jubei"
]