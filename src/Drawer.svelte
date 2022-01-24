<script lang="ts">
    import Upload from "./Upload.svelte";
    import Drawer, { Content, Header, Title, Subtitle, Scrim } from '@smui/drawer';
    import List, { Item, Graphic, Text, Separator } from "@smui/list";
    import Kitchen, { KitchenComponentDev } from '@smui/snackbar/kitchen';

    import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, User, UserCredential, signOut } from "firebase/auth";
    import { auth } from "./lib/firebase";

    import { loadCfpl } from "./lib/games/bbcf";

    export let smallScreen: boolean = false;
    export let drawerOpen: boolean = true;

    export let active: number;

    let kitchen: KitchenComponentDev;

    let user: User = null;
    onAuthStateChanged(auth, (authUser: User) => {
        if (authUser) user = authUser;
        else user = null;
    });

    function signInGoogle(): Promise<void> {
        return new Promise((res, rej) => {
            const provider = new GoogleAuthProvider();

            signInWithPopup(auth, provider)
            .then((result: UserCredential) => {
                kitchen.push({
                    label: `Signed in as ${result.user.displayName}.`,
                    dismissButton: true
                });
                res();
            })
            .catch((err) => {
                kitchen.push({
                    label: `${err.message}`,
                    dismissButton: true
                });
                rej(err);
            })
        });
    }

    function signOutWithSnack(): Promise<void> {
        return new Promise((res, rej) => {
            signOut(auth)
            .then(() => {
                kitchen.push({
                    label: "Signed out.",
                    dismissButton: true
                });
                res();
            })
            .catch((err) => {
                kitchen.push({
                    label: `${err.message}`,
                    dismissButton: true
                });
                rej(err);
            })
        });
    }

    let uploadInput: HTMLInputElement = document.createElement("input");
    uploadInput.setAttribute("type", "file");
    uploadInput.setAttribute("accept", ".cfpl");

    let uploadDialog: Upload;

    uploadInput.addEventListener("change", async () => {
        if (uploadInput.files.length == 0) return;

        const buffer = await uploadInput.files[0].arrayBuffer();
        try {
            const cfpl = loadCfpl(buffer);
            uploadDialog.openUpload(cfpl);
        } catch (err) {
            kitchen.push({
                label: `${err}`,
                dismissButton: true
            });
        } finally {
            // Remove what's in the input
            uploadInput.value = "";
        }
    });
</script>

<Kitchen bind:this={kitchen} dismiss$class="material-icons" />

<Upload bind:this={uploadDialog}/>

<div class:fullHeight={!smallScreen}>
    <Drawer variant={smallScreen ? 'modal' : undefined} bind:open={drawerOpen}>
        {#if user != null}
            <Header>
                <Title>{user.displayName}</Title>
                <Subtitle>{user.email}</Subtitle>
            </Header>
        {/if}
        <Content>
            <List singleSelection>
                {#if user == null}
                    <Item on:SMUI:action={signInGoogle}>
                        <Graphic class="material-icons">account_circle</Graphic>
                        <Text>Sign in with Google</Text>
                    </Item>
                {:else}
                    <Item on:SMUI:action={() => {uploadInput.click()}}>
                        <Graphic class="material-icons">publish</Graphic>
                        <Text>Upload Palette</Text>
                    </Item>
                    <Item on:SMUI:action={signOutWithSnack}>
                        <Graphic class="material-icons">logout</Graphic>
                        <Text>Sign Out</Text>
                    </Item>
                {/if}

                <Separator />

                <Item selected={active == 0} on:SMUI:action={() => {active = 0}}>
                    <Graphic class="material-icons">collections</Graphic>
                    <Text>Palette Collection</Text>
                </Item>
                <!-- <Item selected={active == 1} on:SMUI:action={() => {active = 1}}>
                    <Graphic class="material-icons">help_center</Graphic>
                    <Text>Installation Help</Text>
                </Item>
                <Item selected={active == 2} on:SMUI:action={() => {active = 2}}>
                    <Graphic class="material-icons">info</Graphic>
                    <Text>About</Text>
                </Item> -->
            </List>
        </Content>
    </Drawer>

    <Scrim />
</div>

<style lang="scss">
    .fullHeight {
        height: 100vh;
        position: fixed;
    }
</style>