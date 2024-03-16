<script lang="ts">
    import { fly } from "svelte/transition";
    import ReactIcon from "./reactIcon.svelte";
    import { flip } from "svelte/animate";

    let reactedBy: Map<string, string> = new Map();

    /*
    let reacts: Map<string, string[]> = new Map();

    $: {
        //convert reacts to map group by react, and uid
        reacts = new Map();
        for (const [uid, react] of reactedBy){
            if (reacts.has(react)) {
                reacts.get(react)?.push(uid);
            } else {
                reacts.set(react, [uid]);
            }
        }
    }
    */

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

    $: console.log(reacts);

    function addReact(uid: string, react: string) {
        reactedBy.set(uid, react);
        reactedBy = new Map(reactedBy);
        console.log(reactedBy);
    }

    function removeReact(uid: string, react: string) {
        reactedBy.delete(uid);

        reactedBy = new Map(reactedBy);
    }

    //detect which react is new

    const reactButtons = ["👍", "❤️", "😂", "😮", "😢", "😡"];
</script>

<div class="pad"></div>

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

<button
    on:click={() => {
        reactedBy = new Map();
    }}>Reset</button
>

<div class="util">
    {#each [1, 2, 3, 4] as user}
        <div class="addRemove">
            <div class="name">User {user}</div>
            {#each reactButtons as reactIcon}
                <div class="button-container">
                    {reactIcon}
                    <button
                        on:click={() => {
                            addReact(user.toString(), reactIcon);
                        }}
                    >
                        Add
                    </button>
                    <button
                        on:click={() => {
                            removeReact(user.toString(), reactIcon);
                        }}
                    >
                        Remove
                    </button>
                </div>
            {/each}
        </div>
    {/each}
</div>

<style lang="scss">
    .pad {
        margin-top: 200px;
    }

    .util {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        align-items: center;
        justify-content: safe center;
        gap: 2px;
        font-size: 0.7rem;
    }

    .addRemove {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        gap: 2px;
        font-size: 0.7rem;

        .button-container {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: flex-start;
            margin-right: 10px;
        }
    }

    button {
        background: #00bcd4;
        border: none;
        color: white;
        padding: 5px 10px;
        margin: 0 5px;
        border-radius: 10px;
    }

    .reactsContainer {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        background: var(--option-color);
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
