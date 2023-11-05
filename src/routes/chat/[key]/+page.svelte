
<script lang="ts">
    import ErrorPage from './../../errorPage.svelte';
    import UserInfoForm from './../../userInfoForm.svelte';
    import {isConnected, usedUsernames, usedAvatars, chatRoomStore} from '$lib/store';
    import { authSocket } from '../../authSocket';
    export let data;

    if (data.props.res.success){

        authSocket.connect();

        usedUsernames.set(data.props.res.usernames);
        usedAvatars.set(data.props.res.avatars);
        chatRoomStore.update(room => {
            room.Key = data.props.res.key as string;
            return room;
        });
    } else {
        authSocket.disconnect();
    }
</script>

{#if data.props.res.success && !$isConnected}    
    <UserInfoForm/>
{:else if data.props.res.success != true}
    <ErrorPage errorMessage={{message: data.props.res.message, buttonText: 'Home', code: data.props.res.statusCode || 404, icon: '404', title: data.props.res.message }} />
{/if}