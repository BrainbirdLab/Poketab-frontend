<script lang="ts">
    import { isConnected, showUserInputForm } from "$lib/store";
    import UserInfoForm from "./userInfoForm.svelte";
    import JoinForm from "./joinForm.svelte";
    import ChatPage from "./chat/chatPage.svelte";
</script>

{#if !$isConnected}
    <!-- Show form -->
    {#if $showUserInputForm}
        <UserInfoForm />
    {:else}
        <JoinForm />
    {/if}
{:else}
    <ChatPage />
{/if}