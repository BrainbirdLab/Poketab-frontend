<script lang="ts">
    import { themeAccent } from "$lib/themes";
    import { toSentenceCase } from "$lib/utils";
    import { fly } from "svelte/transition";
    import { showThemesPanel } from "./modalManager";

	let selectedTheme = localStorage.getItem('theme') || 'ocean';

    function hideThemes(node: HTMLElement){

        const method = (e: Event) => {

            if (e.target == null){
                return;
            }

            const elem = e.target as HTMLElement;

            if (e.target !== node) {
                const targetElement = e.target as HTMLElement;
                console.log(`Theme ${toSentenceCase(targetElement.id)} applied`);
				selectedTheme = targetElement.id;
				localStorage.setItem('theme', selectedTheme);
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

<!--

    this function generates the theme picker in normal html and js. So make a svelte component that does the same thing
/**
 * Loads theme
 */
async function loadTheme() {
	//append the theme to the DOM
	const themePicker = document.createElement('div');
	themePicker.id = 'themePicker';
	themePicker.className = 'themePicker';

	const themeListFragment = fragmentBuilder({
		tag: 'ul',
		attr: {
			class: 'themeList'
		},
		childs: themeArray.map((theme) => {
			return {
				tag: 'li',
				attr: {
					class: 'theme clickable playable',
					id: theme
				},
				childs: [
					{
						tag: 'img',
						attr: {
							class: 'themeIcon',
							src: `/images/backgrounds/${theme}_icon.webp`,
							alt: 'Theme Thumbnail'
						}
					},
					{
						tag: 'span',
						text: theme.charAt(0).toUpperCase() + theme.slice(1)
					}
				]
			};
		})
	});

	themePicker.appendChild(themeListFragment);

	document.body.appendChild(themePicker);

	//remove the theme optons from the screen when clicked outside
	themePicker.addEventListener('click', () => {
		hideThemes();
	});

	THEME = localStorage.getItem('theme');
	if (THEME == null || themeArray.includes(THEME) == false) {
		THEME = 'ocean';
		localStorage.setItem('theme', THEME);
	}
	document.documentElement.style.setProperty('--pattern', `url('../images/backgrounds/${THEME}_w.webp')`);
	document.documentElement.style.setProperty('--secondary-dark', themeAccent[THEME].secondary);
	document.documentElement.style.setProperty('--msg-get', themeAccent[THEME].msg_get);
	document.documentElement.style.setProperty('--msg-get-reply', themeAccent[THEME].msg_get_reply);
	document.documentElement.style.setProperty('--msg-send', themeAccent[THEME].msg_send);
	document.documentElement.style.setProperty('--msg-send-reply', themeAccent[THEME].msg_send_reply);
	document.querySelector('meta[name="theme-color"]').setAttribute('content', themeAccent[THEME].secondary);

	//make a request to the server to update the cookie
	const themeRequest = new XMLHttpRequest();
	themeRequest.open('PUT', '/theme');
	themeRequest.setRequestHeader('Content-Type', 'application/json');
	themeRequest.send(JSON.stringify({ theme: THEME }));

	document.querySelectorAll('.theme').forEach(theme => {
		theme.addEventListener('click', (evt) => {
			THEME = evt.target.closest('li').id;
			localStorage.setItem('theme', THEME);
			showPopupMessage('Theme applied');
			//make a request to the server to update the cookie
			const themeRequest = new XMLHttpRequest();
			themeRequest.open('PUT', '/theme');
			themeRequest.setRequestHeader('Content-Type', 'application/json');
			themeRequest.send(JSON.stringify({ theme: THEME }));
			if (quickReactsEnabled == 'true') {
				quickReactEmoji = themeAccent[THEME].quickEmoji;
				localStorage.setItem('quickEmoji', quickReactEmoji);
				sendButton.dataset.role = 'quickEmoji';
			}
			chooseQuickEmojiButton.querySelector('.quickEmojiIcon').textContent = quickReactEmoji;
			//edit css variables
			document.documentElement.style.setProperty('--pattern', `url('../images/backgrounds/${THEME}_w.webp')`);
			document.documentElement.style.setProperty('--secondary-dark', themeAccent[THEME].secondary);
			document.documentElement.style.setProperty('--msg-get', themeAccent[THEME].msg_get);
			document.documentElement.style.setProperty('--msg-get-reply', themeAccent[THEME].msg_get_reply);
			document.documentElement.style.setProperty('--msg-send', themeAccent[THEME].msg_send);
			document.documentElement.style.setProperty('--msg-send-reply', themeAccent[THEME].msg_send_reply);
			//Todo
			document.querySelector('meta[name="theme-color"]').setAttribute('content', themeAccent[THEME].secondary);
			hideOptions();
		});
	});

	const quickEmojiFromLocalStorage = localStorage.getItem('quickEmoji');
	//console.log(quickEmojiFromLocalStorage, themeAccent[THEME]);
	if (quickEmojiFromLocalStorage) {
		//console.log(`Found in local storage: ${quickEmojiFromLocalStorage}`);
		if (reactArray.expanded.includes(quickEmojiFromLocalStorage)) {
			quickReactEmoji = quickEmojiFromLocalStorage;
			//console.log(`Quick Emoji in expanded emojis: ${quickReactEmoji}`);
		} else {
			quickReactEmoji = themeAccent[THEME].quickEmoji;
			//console.log(`Setting from theme: ${quickReactEmoji}`);
		}
	} else {
		quickReactEmoji = themeAccent[THEME].quickEmoji;
		//console.log(`Not found in local storage: ${quickEmojiFromLocalStorage}`);
	}

	localStorage.setItem('quickEmoji', quickReactEmoji);
	//console.log(`Quick Emoji: ${quickReactEmoji}`);

	if (quickReactsEnabled == 'true') {
		sendButton.innerHTML = `<span class="quickEmoji">${quickReactEmoji}</span>`;
	} else {
		sendButton.innerHTML = '<i class="fa-solid fa-paper-plane"></i>';
	}
}

-->

{#if $showThemesPanel}
<div id="themePicker" class="themePicker active" use:hideThemes>
    <ul class="themeList" transition:fly={{y: 30, duration: 100}}>
        {#each Object.keys(themeAccent) as themename, i}
        <li transition:fly|global={{y: 20, delay: i*20}} class="theme hoverShadow clickable playable" id="{themename}" data-duration="{i}">
            <img class="themeIcon" class:selected={selectedTheme == themename} src="/images/backgrounds/{themename}_icon.webp" alt="{themename} Thumbnail" /><span>{toSentenceCase(themename)}</span>
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
                border-radius: 50%;
            }
            .themeIcon.selected{
                outline: 2px solid var(--secondary-dark);
            }
        }
    }
}

</style>
