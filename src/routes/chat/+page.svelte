<script lang="ts">
    import { currentTheme } from "$lib/store";
    
    export let data;

    currentTheme.set(data.themename);
</script>