<script lang="ts">
    import ImageList, { Item, Image } from '@smui/image-list';
    import Paper, { Title, Subtitle } from '@smui/paper';
    import IconButton from '@smui/icon-button';
    import { fly } from 'svelte/transition';
    import type { UploadData } from "./lib/palette";
	import { collection, getFirestore, query, orderBy, /*limit, startAt,*/ onSnapshot, deleteDoc, doc } from "firebase/firestore";
	import { getDownloadURL, getStorage, ref } from 'firebase/storage';
	import { onAuthStateChanged, User } from 'firebase/auth';
	import { auth } from './lib/firebase';
	import { characterSearchNames, characterFullNames } from './lib/games/bbcf';

	let user: User = null;
    onAuthStateChanged(auth, async(authUser: User) => {
        if (authUser) user = authUser;
        else user = null;
    });

    interface PalElement {
        id: string,
        data: UploadData,
        hovering: boolean,
        // menu?: MenuComponentDev
    }

	export let filter: string = "";

	let palList: PalElement[] = [];
	let filterList: PalElement[] = [];

	interface FilterParameter {
		type: string,
		data: any
	}

	/** Applies the filter to the current palette list */
	export function applyFilter() {
		// Parse the string to get any parameters
		let split = filter.toLowerCase().split(" ");
		let param: FilterParameter[] = [];
		
		for (let i = 0; i < split.length; i++) {
			console.log(split[i]);
			switch(split[i]) {
				case "char:":
					// Get the character id
					let id = characterSearchNames.findIndex((e) => {
						return e.includes(split[i + 1].toLowerCase());
					})

					param.push({
						type: "char",
						data: id
					});

					// Skip the next string since we've read it
					i++;
					break;
				default:
					param.push({
						type: "name",
						data: split[i].toLowerCase()
					});
			}
		}

		filterList = palList;
		param.forEach((e) => {
			filterList = filterList.filter((item) => {
				switch(e.type) {
					case "char":
						return item.data.char === e.data;
					case "name":
						return item.data.name.toLowerCase().includes(e.data);
				}
			});
		});
	}

	const db = getFirestore();
	const storage = getStorage();
	const palettesRef = collection(db, "palettes");
	const pageLimit = 50;

	const q = query(palettesRef, orderBy("createdOn"), /*limit(pageLimit), startAt(palList.length)*/);

	onSnapshot(q, async(snapshot) => {
		let newPals: PalElement[] = [];

		snapshot.docChanges().forEach((change) => {
			if (change.type === "added") {
				let data = change.doc.data();

				newPals.unshift({
					id: change.doc.id,
					data: {
						img: data.img,
						pal: data.pal,

						name: data.name,
						auth: data.auth,
						desc: data.desc,

						char: data.char,

						poster: data.poster,

						likes: data.likes,
						createdOn: data.createdOn
					},
					hovering: false
				});
			}
			else if (change.type === "removed") {
				let index = palList.findIndex((pal) => pal.id === change.doc.id);
				palList.splice(index, 1)
			}
		});

		async function waitForUrls(index: number): Promise<void> {
			try {
				let imgLink = await getDownloadURL(ref(storage, newPals[index].data.img));
				newPals[index].data.img = imgLink;
			}
			catch (err) {
				await waitForUrls(index);
			}
		}

		let urlWaits: Promise<void>[] = [];

		newPals.forEach((e, i) => {
			urlWaits.push(waitForUrls(i));
		})

		Promise.all(urlWaits).then(() => {
			palList = newPals.concat(palList)
			applyFilter();
		})
	});

	async function deletePalette(id: string) {
		await deleteDoc(doc(db, "palettes", id))
	}
</script>

<div class="pal-gallery-container">
    <ImageList class="pal-gallery" masonry>
        {#each filterList as pal (pal.id)}
                <Item>
                    <div 
                        class="pal-image" in:fly={{y: 20}}
                        on:mouseenter={() => {pal.hovering = true}}
                        on:mouseleave={() => {pal.hovering = false}}
                    >
                        <Image src={pal.data.img}></Image>
                        <Paper class="image-overlay {pal.hovering ? "active" : ""}" variant="unelevated">
                            <Title>{pal.data.name} <span style="margin: 0; color: #888;">- {pal.data.auth}</span></Title>
                            <Subtitle>
                                {pal.data.desc}
                            </Subtitle>
                            <div class="bottom-bar">
                                <img class="game-icon" src="/assets/bbcf_icon.png" alt="BBCF" />
								<span style="margin: 0; color: #888; font-family: Roboto; text-align: center;">{characterFullNames[pal.data.char]}</span>
                                <div class="buttons">
                                    <!-- <IconButton class="material-icons">favorite</IconButton> -->
                                    <IconButton class="material-icons" on:click={async() => {window.open(await getDownloadURL(ref(storage, pal.data.pal)));}}>file_download</IconButton>
									{#if user !== null && user.uid === pal.data.poster}
										<IconButton class="material-icons" on:click={() => {deletePalette(pal.id)}}>delete</IconButton>
									{/if}
                                </div>
                            </div>
                        </Paper>
                    </div>
                </Item>
        {/each}
    </ImageList>
</div>

<style lang="scss">
    @use '@material/image-list/index' as image-list;

    .pal-gallery-container {
        margin: 10px;
    }

    :global(.pal-gallery) {
        @include image-list.masonry-columns(6);
    }

    @media (max-width: 1800px) {
        :global(.pal-gallery) {
            @include image-list.masonry-columns(5);
        }
    }

    @media (max-width: 1400px) {
        :global(.pal-gallery) {
            @include image-list.masonry-columns(4);
        }
    }
    
    @media (max-width: 1000px) {
        :global(.pal-gallery) {
            @include image-list.masonry-columns(3);
        }
    }

    /* Small Mode */
    @media (max-width: 900px) {
        :global(.pal-gallery) {
            @include image-list.masonry-columns(4);
        }
    }

    @media (max-width: 750px) {
        :global(.pal-gallery) {
            @include image-list.masonry-columns(3);
        }
    }

    @media (max-width: 600px) {
        :global(.pal-gallery) {
            @include image-list.masonry-columns(2);
        }
    }

    .pal-image {
        display: inline-block;
        background-color: #424242;
        border-radius: 10px;
        /* For the overlay to work */
        position: relative;
    }

    :global(.image-overlay) {
        position: absolute;
        top: 0;
        left: 0;

        /* I have to fight the component lol */
        width: calc(100% - 32px);
        height: calc(100% - 48px);

        background-color: #000000BE !important;
        border-radius: 10px !important;
        
        opacity: 0;
        transition: opacity 0.2s;

        .bottom-bar {
            position: absolute;
            width: calc(100% - 16px);
            left: 8px;
            bottom: 8px;

            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;

            .game-icon {
                width: 32px;
                height: 32px;
                margin: 8px;
            }

            .buttons {
                display: flex;
            }
        }
    }

    :global(.image-overlay.active) {opacity: 1 !important;}

    /* Disable the overlay, I'll make a dialog for this. */
    @media (max-width: 600px) {
        :global(.image-overlay:hover) {
            opacity: 0;
        }
    }
    
</style>