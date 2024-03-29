<script context="module" lang="ts">
    type ThemeAccent = {
        [key: string]: {
            quickEmoji: string;
        };
    };

//theme colors and backgrounds
export const themes: ThemeAccent = {
    'Blue': {
        quickEmoji: '🥶',
    },
    'Ocean': {
        quickEmoji: '🐳',
    },
    'Cyberpunk': {
        quickEmoji: '👾',
    },
    'Geometry': {
        quickEmoji: '🔥',
    },
    'Blackboard': {
        quickEmoji: '👽',
    },
    'Forest': {
        quickEmoji: '🍃',
    }
};
</script>

<script lang="ts">

    import { toSentenceCase } from "$lib/utils";
    import { fly } from "svelte/transition";
    import { showToastMessage } from "domtoastmessage";
    import { currentTheme, quickEmoji } from "$lib/store";

    function handleThemes(node: HTMLElement){

        const method = (e: Event) => {

            console.log('click');

            if (e.target == null){
                return;
            }

            if (e.target !== node) {
                const targetElement = e.target as HTMLElement;

                if (!targetElement.classList.contains("theme")){
                    return;
                }

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

            //showThemesPanel.set(false);
            history.back();
            console.log("Theme picker closed");
        }

        node.onclick = method;

        return {
            destroy(){
                node.onclick = null;
                console.log("Destroyed theme picker");
            }
        }
    }

</script>

<div class="themePicker" use:handleThemes>
    <ul class="themeList back-blur" transition:fly={{y: 20, duration: 100}}>
        {#each Object.keys(themes) as themename, i}
        <li transition:fly|global={{y: 20, delay: 20 * (i + 1)}} class="theme hoverShadow clickable playable" id="{themename}">
            <img class="themeIcon" class:selected={$currentTheme == themename} src="/images/backgrounds/{themename}_icon.webp" alt="{themename} Thumbnail" /><span>{themename}</span>
        </li>
        {/each}
    </ul>
</div>

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

    .themeList {
        display: flex;
        flex-direction: column;
        width: min(85vw, 315px);
        gap: 10px;
        padding: 20px;
        background: var(--modal-color);
        filter: drop-shadow(0 4px 5px var(--shadow-color));
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
