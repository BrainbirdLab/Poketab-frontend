
<script lang="ts">
    import {chatRoomStore, joinError, joinKey, showUserInputForm} from "$lib/store.svelte";
    import {currentTheme} from "$lib/settings.svelte";

    let { data } = $props();

    currentTheme.value = data.themename;
    
    if (!data.success){
        joinKey.value = data.key;
        showUserInputForm.value = false;
        joinError.value = {text: data.message, icon: data.icon};
    } else {
        chatRoomStore.update(room => {
            room.Key = data.key;
            room.userList = data.users;
            room.maxUsers = data.maxUsers;
            return room;
        });
        showUserInputForm.value = true;
    }
</script>