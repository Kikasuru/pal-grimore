import { Color, Palette } from "../palette"

// File format here https://github.com/kovidomi/BBCF-Improvement-Mod/blob/master/src/Palette/impl_format.h

const size = 0x2098;
const header = "IMPLCF\x00\x00";
const palStart = 0x94;
const palSize = 256;

export interface CmplData {
    readonly pal: Palette,
    readonly name: string,
    readonly auth: string,
    readonly desc: string,
    readonly char: number,

    readonly cmpl: ArrayBuffer
}

/**
 * Loads a BBCF CMPL file into a palette.
 * @param {ArrayBuffer} file - The CMPL file in an ArrayBuffer.
 * @returns {CmplData} The data for this file.
 */
export function loadCmpl(file: ArrayBuffer): CmplData {
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
    return { pal: new Palette(colors), name, auth, desc, char: pal[0x10], cmpl: file };
}