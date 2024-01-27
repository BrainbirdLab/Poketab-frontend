<script lang="ts">

    export let reactedBy: Map<string, string>;

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

</script>

{#if reactedBy.size > 0}
    <div class="reactsContainer">
        <div class="reacts">
            {#each reacts as [react, uids]}
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
        {#if reactedBy.size > 1}
            <div class="count">
                <!-- Show number of reacts -->
                {reactedBy.size}
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
    //transition: 200ms ease-in-out;
    cursor: pointer;

    &:hover{
        filter: brightness(0.9);
    }

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