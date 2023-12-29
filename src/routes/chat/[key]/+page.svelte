
<script lang="ts">
    import ErrorPage from '../../../lib/components/errorPage.svelte';
    import { chatRoomStore} from '$lib/store';
    import { socket } from '../../../lib/components/socket';
    import Form from '../../form.svelte';

    export let data;

    if (data.props.res.success){

        socket.connect();

        chatRoomStore.update(room => {
            room.Key = data.props.res.key as string;
            room.maxUsers = data.props.res.maxUsers as number;
            room.userList = data.props.res.users;
            return room;
        });

    } else {
        socket.disconnect();
    }
</script>

{#if data.props.res.success}
    <Form/>
{:else if data.props.res.statusCode != 500}
    <!--ErrorPage errorMessage={{message: data.props.res.message, buttonText: 'Home', code: data.props.res.statusCode || 404, icon: '404', title: data.props.res.message }} /-->
    <Form errLog={data.props.res.message} errIcon={data.props.res.icon} />
{:else}
    <ErrorPage errorMessage={{message: 'Something went wrong', buttonText: 'Home', code: 500, icon: '500', title: 'Something went wrong' }} />
{/if}