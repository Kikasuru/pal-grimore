/** Represents a color in RGBA format. */
export class Color {
    /** An array of each value, should be 4 units long. */
    readonly value: Uint8Array;

    /**
     * Creates a color.
     * @param {number} r - Red
     * @param {number} b - Blue
     * @param {number} g - Green
     * @param {number} a - Alpha
     */
    constructor(r: number, b: number, g: number, a: number) {
        this.value = new Uint8Array(4);

        try {
            this.value[0] = r;
            this.value[1] = b;
            this.value[2] = g;
            this.value[3] = a;
        }
        catch (err) { throw err; }
    }
}

/** Represents a palette, comes with image generators. */
export class Palette {
    readonly colors: Color[]

    /**
     * Creates a palette.  Will throw an exception if given more than 256 colors.
     * @param {Color[]} - The colors of the palette.
     */
    constructor(colors: Color[]) {
        if (colors.length > 256) throw "Array exceeds the 256 color limit."

        this.colors = colors;
    }

    /**
     * Generates an image using the palette class.
     * @param {string} img - The src of an image, could be a link or DataURL.
     * @returns {Promise<string>} The DataURL of the generated image.
     */
    genImage(img: string): Promise<string> {
        return new Promise((res, rej) => {
            let baseImg = new Image();

            baseImg.onload = () => {
                let canvas = document.createElement("canvas");
                canvas.height = baseImg.height;
                canvas.width = baseImg.width;

                let ctx = canvas.getContext("2d");
                ctx.drawImage(baseImg, 0, 0);

                // Get the image data of the now drawn image and replace each pixel with the one from the palette.
                let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                for (let i = 0; i < data.length; i += 4) {
                    if (data[i + 3] === 0) continue; // Skip if the pixel is transparent.

                    let index = data[i];
                    if (this.colors[index] === undefined)
                        rej(new Error(`Palette does not have a color in ${index}.`));

                    data[i]     = this.colors[index].value[0];
                    data[i + 1] = this.colors[index].value[1];
                    data[i + 2] = this.colors[index].value[2];
                }
                ctx.putImageData(imageData, 0, 0);

                res(canvas.toDataURL());
            }

            baseImg.src = img;
        });
    }
}

/** Represents the data needed to upload a palette to the database */
export interface UploadData {
    img?: string,
    pal?: string,

    name: string,
    auth: string,
    desc: string,

    char: number,

    poster?: string,

    likes?: number,
    createdOn?: Date
}