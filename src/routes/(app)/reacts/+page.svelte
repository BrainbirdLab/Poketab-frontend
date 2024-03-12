<script lang="ts">

    // uid: react. 
    let reactedBy: Map<string, string> = new Map();
    // react: [uid]
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

    function removeReact(uid: string){
        reactedBy.delete(uid);
        reactedBy = reactedBy;
    }

    function addReact(uid: string, react: string){
        // remove react if it exists
        reactedBy.delete(uid);
        // add react
        reactedBy.set(uid, react);
        reactedBy = reactedBy;
    }

    const reactButtons = [
        "👍",
        "❤️",
        "😂",
        "😮",
        "😢",
        "😡",
    ];

</script>

<div class="pad"></div>

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

<div class="util">
    {#each [1,2,4,5] as user}
    <div class="addRemove">
        <div class="name">User {user}</div>
        {#each reactButtons as reactIcon}
            <div class="button-container">
                {reactIcon} <button on:click={() => { addReact(user.toString(), reactIcon) }} > Add </button> <button on:click={() => { removeReact(user.toString()) }}> Remove </button>
            </div>
        {/each}
    </div>
    {/each}
</div>

<style lang="scss">

.pad{
    margin-top: 300px;
}

.util{
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: safe center;
    gap: 2px;
    font-size: 0.7rem;
}

.addRemove{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 2px;
    font-size: 0.7rem;

    .button-container{
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        margin-right: 10px;

        button{
            background: #00BCD4;
            border: none;
            color: white;
            padding: 5px 10px;
            margin: 0 5px;
            border-radius: 3px;
        }
    }

}


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