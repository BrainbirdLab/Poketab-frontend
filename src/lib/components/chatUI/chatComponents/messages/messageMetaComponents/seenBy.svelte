<script lang="ts">
    import { chatRoomStore } from "$lib/store";
    export let seenBy: Set<string>;
    export let id: string;
</script>

{#if seenBy.size > 0}
{#key seenBy}
<div class="seenBy">
    {#each seenBy as uid}
        {#if $chatRoomStore.userList[uid]?.lastSeenMessage == id}
            <img alt="seen" data-uid="{uid}" src="/images/pokemons/{$chatRoomStore.userList[uid].pokemon}(custom)-mini.webp" />
        {/if}
    {/each}
    <!-- if more than 3 seen, show +n more -->
    {#if seenBy.size > 3}
        <div class="more">
            +{seenBy.size - 3}
        </div>
    {/if}
</div>
{/key}
{/if}

<style lang="scss">

    .seenBy {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 1px;
        position: absolute;
        max-width: 70px;
        right: 2px;
        z-index: 10;

        img{
            height: 10px;
            width: 10px;
            margin: 1px;
        }

        img:not(:nth-last-of-type(-n+3)){
            display: none;
        }

        .more{
            font-size: 0.6rem;
            font-weight: 900;
        }
    }

</style>