
<script lang="ts">
    import {chatRoomStore, joinError, joinKey, showUserInputForm} from "$lib/store.svelte";
    import {currentTheme} from "$lib/settings.svelte";
    import type { chatRoomStoreType } from "$lib/types.js";

    let { data } = $props();

    currentTheme.value = data.themename;
    
    if (!data.success){
        joinKey.value = data.key;
        showUserInputForm.value = false;
        joinError.value = {text: data.message, icon: data.icon};
    } else {
        const newVal: chatRoomStoreType = {
            Key: data.key,
            userList: data.users,
            maxUsers: data.maxUsers,
            admin: "",
        }

        chatRoomStore.value = newVal;
        
        showUserInputForm.value = true;
    }
</script>