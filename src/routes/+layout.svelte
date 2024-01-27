
<script lang="ts">
    import "$lib/styles/global.scss";
    console.log("Mounted root +layout.svelte");

</script>

<svelte:body on:contextmenu|preventDefault/>

<div class="maincontainer">
    <slot />
</div>

<style lang="scss">
    .maincontainer {
        background: rgba(0, 0, 0, 0.6117647059) var(--pattern);
        background-blend-mode: soft-light;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        color: white;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        text-align: justify;
        gap: 20px;
        height: 100%;
        width: 100%;
        overflow: scroll;
    }
</style>