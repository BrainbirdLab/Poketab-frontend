<script lang="ts">
    import "./message.css";
    import type { TextMessageObj } from "./messages";
    import { chatRoomStore, selfInfoStore } from "$lib/store";

    export let message: TextMessageObj;
    export let id: string;
</script>


<li class="message msg-item {message.classList}" id="{id}"> <!-- noreply notitle delevered start end self react -->
    <div class="seenBy"></div>
    <div class="messageContainer">
        <div class="replyIcon">
            <i class="fa-solid fa-reply"></i>
        </div>
        <div class="sent"><i class="fa-regular fa-paper-plane"></i></div>
        {#if message.sender != $selfInfoStore.uid}
        <div class="avatar"><img src="/images/avatars/{($chatRoomStore.userList[message.sender]?.avatar)}(custom).webp" width="30px" height="30px" alt="avatar"></div>
        {/if}
        <div class="messageBody">
            <div class="messageTitle">
                {#if message.sender == $selfInfoStore.uid}
                    You
                {:else}
                    {$chatRoomStore.userList[message.sender]?.name}
                {/if}
            </div>
            <div class="messageReply" data-repid="" data-deleted=""></div>
            <div class="messageMain">
                <div class="msg text"><span class="data text-content">{message.message}</span></div>
                <div class="messageTime">Just Now</div>
            </div>
            <div class="reactsOfMessage">
                <div class="reactsContainer"></div>
                <div class="reactsCount"></div>
            </div>
        </div>
    </div>
</li>