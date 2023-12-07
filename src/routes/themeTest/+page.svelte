

<script lang="ts">
    import { themesMap } from '$lib/themes';
    export let data;
</script>

<svelte:head>
  <link rel="stylesheet" href="/styles/themes/{data.theme}.css">
</svelte:head>

Hello {themesMap[data.theme]}


