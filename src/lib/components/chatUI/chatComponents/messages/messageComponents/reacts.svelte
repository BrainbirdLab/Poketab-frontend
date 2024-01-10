<script lang="ts">
    import type { MessageObj } from "$lib/messageTypes";

    export let reactedBy: MessageObj["reactedBy"];

    let reacts: {[key: string]: string[]} = {};

    $: {
        //convert reacts to object group by react, and uid
        reacts = {};
        for (const [uid, react] of Object.entries(reactedBy)) {
            if (react in reacts) {
                reacts[react].push(uid);
            } else {
                reacts[react] = [uid];
            }
        }
    }

</script>

{#if Object.entries(reactedBy).length > 0}
    <div class="reactsContainer">
        <div class="reacts">
            {#each Object.entries(reacts) as [react, uids]}
                <div class="react-group">
                    {#each uids as uid}
                        <div class="react-container" data-uid={uid}>
                            <div class="react">{react}</div>
                            {#key react}
                                <div class="react-popup" on:animationend={(e) => {
                                    e.currentTarget.remove();
                                }}>{react}</div>
                            {/key}
                        </div>
                    {/each}
                </div>
            {/each}
        </div>
        {#if Object.entries(reactedBy).length > 1}
            <div class="count">
                <!-- Show number of reacts -->
                {Object.entries(reactedBy).length}
            </div>
        {/if}
    </div>
{/if}


<style lang="scss">

.reactsContainer{
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
    transition: 200ms ease-in-out;
    cursor: pointer;

    * {
        pointer-events: none;
    }

    .count{
        font-size: 0.8rem;
        padding: 0 5px 0 0;
    }
    .reacts{
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        //show last 3 reacts
        &:not(:nth-last-child(-n+3)){
            display: none;
        }

        .react-group{
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            position: relative;
            height: 18px;
            aspect-ratio: 1/1;

            .react-container{
                position: absolute;
                display: flex;
                align-items: center;
                justify-content: center;
            }
        }

        .react-group:not(:nth-last-of-type(-n+3)) {
            background: #00BCD4;
            display: none !important;
        }

        .react-popup {
            position: absolute;
            top: 0;
            left: 0;
            opacity: 0;
            transform-origin: bottom;
            animation: popup 500ms alternate 2;
        }
    }
}

@keyframes popup {
    0%{
        transform: scale(1) translateY(0px);
        opacity: 0;
    }
    100%{
        transform: scale(1.6) translateY(-10px);
        opacity: 1;
    }
}

</style>