
<script lang="ts">
    import {chatRoomStore, currentTheme, joinError, joinKey, showUserInputForm} from "$lib/store";

    export let data;

    currentTheme.set(data.themename);
    
    if (!data.success){
        joinKey.set(data.key);
        showUserInputForm.set(false);
        joinError.set({text: data.message, icon: data.icon});
    } else {
        chatRoomStore.update(room => {
            room.Key = data.key;
            room.userList = data.users;
            room.maxUsers = data.maxUsers;
            return room;
        });
        showUserInputForm.set(true);
    }

    console.log('[key] +page.svelte');
</script>