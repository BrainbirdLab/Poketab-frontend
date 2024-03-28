<script lang="ts">

    import { toSentenceCase } from "$lib/utils";
    import { fly } from "svelte/transition";
    import { showThemesPanel } from "$lib/components/modalManager";
    import { showToastMessage } from "domtoastmessage";
    import { themes } from "$lib/themes";
    import { currentTheme, quickEmoji } from "$lib/store";

    function handleThemes(node: HTMLElement){

        const method = (e: Event) => {

            if (e.target == null){
                return;
            }

            if (e.target !== node) {
                const targetElement = e.target as HTMLElement;
                const theme = toSentenceCase(targetElement.id);
				//make a request to the server to update the cookie
                fetch(`/theme/${theme}`, {
                     method: 'PUT'
                }).then(response => {
                     if (response.ok){
                          showToastMessage(`${theme} theme applied`);
                          //edit css variables
                          currentTheme.set(theme);
                          quickEmoji.set(themes[theme].quickEmoji);
                          localStorage.setItem('quickEmoji', themes[theme].quickEmoji);
                     } else{
                          showToastMessage(`Could not apply ${theme} theme`);
                     }
                }).catch(err => {
                     showToastMessage(`Could not apply ${theme} theme`);
                });
			}

            showThemesPanel.set(false);
        }

        node.onclick = method;

        return {
            destroy(){
                node.onclick = null;
            }
        }
    }
</script>

{#if $showThemesPanel}
<div class="themePicker" use:handleThemes>
    <ul class="themeList back-blur" transition:fly={{y: 20, duration: 100}}>
        {#each Object.keys(themes) as themename, i}
        <li transition:fly|global={{y: 20, delay: 20 * (i + 1)}} class="theme hoverShadow clickable playable" id="{themename}">
            <img class="themeIcon" class:selected={$currentTheme == themename} src="/images/backgrounds/{themename}_icon.webp" alt="{themename} Thumbnail" /><span>{themename}</span>
        </li>
        {/each}
    </ul>
</div>
{/if}

<style lang="scss">

.themePicker {
    width: 100vw;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 55;
    transition: 100ms ease-in-out;
    filter: drop-shadow(0 4px 5px var(--shadow-color));

    .themeList {
        display: flex;
        flex-direction: column;
        width: min(85vw, 315px);
        gap: 10px;
        padding: 20px;
        background: var(--modal-color);
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
