<script lang="ts">
    import Dialog, { Header, Title, Content, Actions } from '@smui/dialog';
    import Button, { Label, Icon } from '@smui/button';
    import Textfield from '@smui/textfield';
    import CharacterCounter from '@smui/textfield/character-counter';
    import Kitchen, { KitchenComponentDev } from '@smui/snackbar/kitchen';
    import { getStorage, ref, uploadString, uploadBytes } from 'firebase/storage'
    import { getFirestore, doc, setDoc } from "firebase/firestore";
    import { onAuthStateChanged, User } from "firebase/auth";
    import { auth } from "./lib/firebase";
    import type { CmplData } from "./lib/games/bbcf";
    import type { UploadData } from "./lib/palette";
    import { generatePushID } from './lib/firebase';

    let open = false;
    let imageSrc: string;
    let data: UploadData;
    let pal: CmplData;

    let kitchen: KitchenComponentDev;

    const db = getFirestore();

    let user: User = null;
    onAuthStateChanged(auth, (authUser: User) => {
        if (authUser) user = authUser;
        else user = null;
    });

    /**
     * Opens the upload dialog.
     * @param {CmplData} palData
     */
    export async function openUpload(palData: CmplData) {
        // Create the image and set the data
        imageSrc = await palData.pal.genImage(`/assets/characters/bbcf/${palData.char}.png`);
        data = {name: palData.name, auth: palData.auth, desc: palData.desc, char: palData.char};
        pal = palData;

        open = true;
    }

    const storage = getStorage();

    /**
     * Uploads to the current firebase session
     * @param {UploadData} data
     * @param {CmplData} palData
     */
     async function upload(data: UploadData, palData: CmplData) {
        let id = generatePushID();

        const imgRef = ref(storage, `img/${id}.png`);
        const palRef = ref(storage, `pal/${id}.cmpl`);

        try {
            let imageString = await palData.pal.genImage(`/assets/characters/bbcf/${data.char}.png`);
            uploadString(imgRef, imageString, "data_url");
            uploadBytes(palRef, pal.cmpl);
        }
        catch (err) {
            kitchen.push({
                label: `${err.message}`,
                dismissButton: true
            });
        }

        data.img = imgRef.fullPath;
        data.pal = palRef.fullPath;

        data.poster = user.uid;
        data.likes = 0;
        data.createdOn = new Date(Date.now());

        try {
            await setDoc(doc(db, "palettes", id), data);
        }
        catch (err) {
            kitchen.push({
                label: `${err.message}`,
                dismissButton: true
            });
        }
    }

    let windowWidth: number;
    $: smallScreen = windowWidth < 900;
</script>

<Kitchen bind:this={kitchen} dismiss$class="material-icons" />

<svelte:window bind:innerWidth={windowWidth} />

<Dialog bind:open fullscreen={smallScreen} aria-labelledby="fullscreen-title" aria-describedby="fullscreen-content">
    <Header>
        <Title id="fullscreen-title">Upload Palette</Title>
    </Header>
    <Content id="fullscreen-content">
        <div class="options-container">
            {#if typeof data !== "undefined"}
                <img class="pal-preview" src={imageSrc} alt="Palette Preview" />
                <Textfield bind:value={data.name} label="Name" input$maxlength={32}>
                    <CharacterCounter slot="helper">0 / 32</CharacterCounter>
                </Textfield>
				<Textfield bind:value={data.auth} label="Author" input$maxlength={32}>
                    <CharacterCounter slot="helper">0 / 32</CharacterCounter>
                </Textfield>
                <Textfield textarea bind:value={data.desc} label="Description" input$maxlength={64}>
                    <CharacterCounter slot="internalCounter">0 / 64</CharacterCounter>
                </Textfield>
            {/if}
        </div>
    </Content>
    <Actions>
        <Button action="close">
            <Label>Cancel</Label>
        </Button>
        <Button action="upload" defaultAction on:click={() => upload(data, pal)}>
            <Icon class="material-icons">publish</Icon>
            <Label>Upload</Label>
        </Button>
    </Actions>
</Dialog>

<style lang="scss">
    .options-container {
        display: flex;
        flex-direction: column;

        .pal-preview {
            height: 300px;
            width: 300px;
            flex: 300px 300px 300px;
            object-fit: contain;
            background-color: #424242;
            border-radius: 10px;
        }
    }
</style>