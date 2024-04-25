<script lang="ts">
    import type { ServerMessageObj } from "$lib/messageTypes";
    export let message: ServerMessageObj;
</script>


<li class="msg-item serverMessage" id="{message.id}" data-type="{message.type}">
    {message.text}
</li>


<style lang="scss">
    .serverMessage{
        font-size: 0.7rem;
        text-align: center;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        padding: 10px;
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

    :not(.serverMessage) + .serverMessage {
        margin-top: 15px;
    }


</style>