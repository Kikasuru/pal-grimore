<script lang="ts">
    import { loadCmpl } from "../lib/games/bbcf";

    let fileInput: HTMLInputElement;

	async function createImage() {
        if (fileInput.files.length == 0) {
            alert("No file selected.");
            return;
        }

        // Create an array buffer for the file and start the conversion
        const buffer = await fileInput.files[0].arrayBuffer();
        const cmpl = loadCmpl(buffer);
        console.log(cmpl);
        const imgData = await cmpl.pal.genImage(`/assets/characters/bbcf/${cmpl.char}.png`);

        // Create a new image and put it on the DOM
        const image = document.createElement('img');
        image.src = imgData;
        document.body.appendChild(image);
    }
</script>

<main>
	<input type="file" id="palette" accept=".cfpl" bind:this={fileInput}/>
    <button on:click={createImage}>Create Image</button>
</main>

<style>
	
</style>