<script lang="ts">

    import { toSentenceCase } from "$lib/utils";
    import { fly } from "svelte/transition";
    import { showThemesPanel } from "$lib/components/modalManager";
    import { showPopupMessage } from "$lib/components/popup";
    import { themes } from "$lib/themes";
    import { currentTheme, quickEmoji } from "$lib/store";
	
	let loadedEmoji = localStorage.getItem('quickEmoji');

	if (loadedEmoji != themes[$currentTheme].quickEmoji){
		loadedEmoji = themes[$currentTheme].quickEmoji;
	}
	
	quickEmoji.set(loadedEmoji);

	const unsubQuickEmoji = quickEmoji.subscribe((val) => {
		localStorage.setItem('quickEmoji', val);
	});

    function hideThemes(node: HTMLElement){

        const method = (e: Event) => {

            if (e.target == null){
                return;
            }

            if (e.target !== node) {
                const targetElement = e.target as HTMLElement;
				currentTheme.set(targetElement.id);
                console.log(`Theme ${toSentenceCase(targetElement.id)} applied`);
				showPopupMessage(`${toSentenceCase(targetElement.id)} theme applied`);
				//make a request to the server to update the cookie
				const themeRequest = new XMLHttpRequest();
				themeRequest.open('PUT', '/theme');
				themeRequest.setRequestHeader('Content-Type', 'application/json');
				themeRequest.send(JSON.stringify({ theme: $currentTheme }));
				//after response from server
				themeRequest.onreadystatechange = () => {
					if (themeRequest.readyState == 4 && themeRequest.status == 200) {
						console.log('Theme updated');
					} else{
						console.log('Theme update failed');
					}
				};
				//edit css variables
				currentTheme.set($currentTheme);
			}

            showThemesPanel.set(false);
        }

        node.onclick = method;

        return {
            destroy(){
                node.onclick = null;
				unsubQuickEmoji();
            }
        }
    }
</script>

{#if $showThemesPanel}
<div id="themePicker" class="themePicker active" use:hideThemes>
    <ul class="themeList" transition:fly={{y: 30, duration: 100}}>
        {#each Object.keys(themes) as themename, i}
        <li transition:fly|global={{y: 20, delay: i*20}} class="theme hoverShadow clickable playable" id="{themename}" data-duration="{i}">
            <img class="themeIcon" class:selected={$currentTheme == themename} src="/images/backgrounds/{themename}_icon.webp" alt="{themename} Thumbnail" /><span>{toSentenceCase(themename)}</span>
        </li>
        {/each}
    </ul>
</div>
{/if}


<style lang="scss">

.themePicker {
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 55;
    transition: 100ms ease-in-out;
    filter: drop-shadow(0 4px 5px black);

    .themeList {
        display: flex;
        flex-direction: column;
        width: min(85vw, 315px);
        gap: 10px;
        padding: 20px;
        background: var(--primary-dark);
        border-radius: 10px;

        .theme {
            display: flex;
            flex-direction: row;
            align-items: center;
            padding: 5px;
            border-radius: 10px;
            gap: 10px;

            *{
                pointer-events: none;
            }

            .themeIcon {
                width: 50px;
				min-width: 50px;
				aspect-ratio: 1;
                border-radius: 50%;
            }
            .themeIcon.selected{
                border: 3px solid var(--secondary-dark);
            }
        }
    }
}

</style>
