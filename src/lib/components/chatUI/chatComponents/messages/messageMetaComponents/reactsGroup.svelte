<script lang="ts">
    import ReactIcon from "./reactIcon.svelte";
    import { flip } from "svelte/animate";

    export let reactedBy: Map<string, string> = new Map();

    //use reactive declaration to group reacts by react and uid
    $: reacts = Array.from(reactedBy).reduce((acc, [uid, react]) => {
        if (acc.has(react)) {
            const uids = acc.get(react) as string[];
            acc.delete(react);
            acc.set(react, [...uids, uid]);
        } else {
            acc.set(react, [uid]);
        }
        return acc;
    }, new Map<string, string[]>());

</script>

{#if reactedBy.size > 0}
<div class="reactsContainer">
    <div class="reacts">
        {#each reacts as [react, users] (react)}
            <div class="wrapper-react" animate:flip>
                <ReactIcon react={react} users={users}/>
            </div>
        {/each}
    </div>
    <div class="count">{reactedBy.size}</div>
</div>
{/if}


<style lang="scss">


.reactsContainer {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        background: var(--dark-color);
        border-radius: 18px;
        width: max-content;
        margin-top: -10px;
        margin-bottom: 1px;
        z-index: 1;
        //transition: 200ms ease-in-out;
        cursor: pointer;

        &:hover {
            filter: brightness(0.9);
        }

        * {
            pointer-events: none;
        }

        .count {
            font-size: 0.8rem;
            padding: 0 5px 0 0;
        }

        .reacts {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: flex-start;
        }

        .wrapper-react:not(:nth-last-of-type(-n + 3)) {
            background: #00bcd4;
            //display: none !important;
        }
    }
</style>