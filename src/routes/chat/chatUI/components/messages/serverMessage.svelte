<script lang="ts">
    import type { ServerMessageObj } from "./messages";
    export let message: ServerMessageObj;
    export let id: string;
</script>


<div class="msg-item serverMessage" id="{id}" data-type="{message.type}">
    {message.text}
</div>


<style lang="scss">
    .serverMessage{
        font-size: 0.7rem;
        text-align: center;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
    }

    .serverMessage[data-type="join"]{
        color: var(--secondary-dark);
    }

    .serverMessage[data-type="leave"]{
        color: #8c96a2;
    }

    .serverMessage[data-type="warn"]{
        color: tomato;
    }


</style>