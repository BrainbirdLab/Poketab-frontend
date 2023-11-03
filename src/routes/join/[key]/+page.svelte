
<script lang="ts">
import ErrorPage from '../../errorPage.svelte';
import UserInfoForm from '../../entry/userInfoForm.svelte';
import {isConnected} from '$lib/store';
//get prop from the load function
export let data;
</script>

{#if data.props.chatData.success && !$isConnected}    
<UserInfoForm/>
{:else if data.props.chatData.success != true}
<ErrorPage message={{text: data.props.chatData.message, buttonText: 'Home', code: data.props.chatData.code || 404 }} />
{/if}