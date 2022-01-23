<script lang="ts">
    import TopAppBar, {  Row, Section, Title as TopTitle, AutoAdjust, TopAppBarComponentDev } from '@smui/top-app-bar';
    import IconButton from '@smui/icon-button';
    import Paper from '@smui/paper';
    import { Icon } from '@smui/common';
    import { Input } from '@smui/textfield';
    import Drawer from "./Drawer.svelte";
    import Gallery from './Gallery.svelte';

    let topAppBar: TopAppBarComponentDev;
    let drawerOpen = false;

	let appGallery: Gallery;

    let searchOpen = false;
    let filter = "";
    function handleKeyDown(event: CustomEvent | KeyboardEvent) {
        event = event as KeyboardEvent;
        if (event.key === 'Enter') {
            appGallery.applyFilter();
        }
    }

    let windowWidth: number;
    $: smallScreen = windowWidth < 900;

    let active = 0;
</script>

<svelte:window bind:innerWidth={windowWidth} />

{#if smallScreen}
    <Drawer smallScreen bind:drawerOpen bind:active />
{/if}

<TopAppBar bind:this={topAppBar} variant="standard" color="background" dense>
    <Row>
        <Section>
            {#if smallScreen} <IconButton class="material-icons" on:click="{() => drawerOpen = !drawerOpen}">menu</IconButton> {/if}
            {#if !searchOpen || !smallScreen} <TopTitle>Palette Grimore</TopTitle> {/if}
        </Section>
        <Section align="end" toolbar>
            {#if !smallScreen || searchOpen}
                <div class="textfield-container" class:full-width={smallScreen}>
                    <Paper class="solo-paper" elevation={6}>
                        <Icon class="material-icons">filter_alt</Icon>
                        <Input bind:value={filter} on:keydown={handleKeyDown} placeholder="Filter" class="solo-input" />
                    </Paper>
                </div>
                {#if smallScreen} <IconButton class="material-icons" on:click="{() => searchOpen = !searchOpen}">cancel</IconButton> {/if}
            {:else}
                <IconButton class="material-icons" on:click="{() => searchOpen = !searchOpen}">search</IconButton>
            {/if}
        </Section>
    </Row>
</TopAppBar>

<AutoAdjust {topAppBar}>
    {#if !smallScreen} <Drawer bind:active /> {/if}
    <div class:app-content-drawer={!smallScreen}>
        {#if active == 0} <Gallery bind:filter bind:this={appGallery} /> {/if}
    </div>
</AutoAdjust>

<style lang="scss">
    :global(body) {
        overflow: scroll;
        overflow-x: hidden;
        margin: 0;
    }

    :global(body)::-webkit-scrollbar {
        width: 0;  /* Remove scrollbar space */
    }

    .app-content-drawer {
        margin-left: 256px;
    }

    .textfield-container {
        height: 40px;
    }

    * :global(.solo-paper) {
        display: flex;
        align-items: center;
        flex-grow: 1;
        max-width: 600px;
        margin: 0 12px;
        padding: 0 12px;
        height: 40px;
    }
    * :global(.solo-paper > *) {
        display: inline-block;
        margin: 0 12px;
    }
    * :global(.solo-input) {
        flex-grow: 1;
        color: #ffffff;
    }
    * :global(.solo-input::placeholder) {
        color: #ffffff;
        opacity: 0.6;
    }
</style>