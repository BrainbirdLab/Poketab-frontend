
<script lang="ts">
    
    function notify() {
        console.log(Notification.permission);
        Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
                const n = new Notification('1112-222', {
                    body: "Hello",
                    data:  "some data",
                    icon: `/images/avatars/Pikachu(custom).webp`,
                    tag: 'msg'
                });

                n.onerror = (e) => {
                    console.log(e);
                }
            }
        });
    }
</script>

<button onclick={notify}>Click</button>

<style lang="scss">
    button {
        padding: 10px;
        background-color: #f00;
        color: #fff;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }
</style>