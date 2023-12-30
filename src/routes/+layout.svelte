
<script lang="ts">
    import "$lib/styles/global.scss";
    import { onDestroy, onMount } from "svelte";
    import { currentTheme } from "$lib/store";
    import {themes} from "$lib/themes";
    import type { Unsubscriber } from "svelte/motion";

    let unsubTheme: Unsubscriber;

    onMount(() => {
        //insert theme variables
        unsubTheme = currentTheme.subscribe((val) => {
            document.documentElement.style.setProperty("--secondary-dark", themes[val].secondary);
            document.documentElement.style.setProperty("--msg-get", themes[val].msg_get);
            document.documentElement.style.setProperty("--msg-get-reply", themes[val].msg_get_reply);
            document.documentElement.style.setProperty("--msg-send", themes[val].msg_send);
            document.documentElement.style.setProperty("--msg-send-reply", themes[val].msg_send_reply);
            document.documentElement.style.setProperty('--pattern', `url('/images/backgrounds/${val}_w.webp')`);
        });
    });

    onDestroy(() => {
        if (unsubTheme) {
            unsubTheme();
        }
    });

</script>

<svelte:body on:contextmenu|preventDefault/>

<slot />