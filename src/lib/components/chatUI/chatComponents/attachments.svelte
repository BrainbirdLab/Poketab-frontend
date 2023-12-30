<script lang="ts">
    import { fly, scale } from "svelte/transition";
    import { showAttachmentPickerPanel } from "$lib/components/modalManager";
    import { showToastMessage } from "$lib/components/toast";
    import { socket } from "$lib/components/socket";
    import { selfInfoStore } from "$lib/store";

    function transmitLocation() {

        if (!navigator.geolocation){
            showToastMessage('Geolocation is not supported by this browser.');
        }

        console.log("Transmitting location...");

        //try to get location with high accuracy and timeout of 5 seconds.
        let timeout = setTimeout(() => {
            showToastMessage('Unable to get location.');
        }, 5000);

        navigator.geolocation.getCurrentPosition((position) => {
            clearTimeout(timeout);
            const {latitude, longitude} = position.coords;
            console.log(`${latitude}°N, ${longitude}°E`);
            socket.emit('location', {latitude, longitude}, $selfInfoStore.uid);
        }, (error) => {
            clearTimeout(timeout);
            showToastMessage('Unable to get location.');
        }, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        });
    }

    function attachmentsClickHandler(node: HTMLElement) {
        const clickHandler = (e: Event) => {
            showAttachmentPickerPanel.set(false);
        };

        node.onclick = clickHandler;

        return {
            destroy() {
                node.onclick = null;
            },
        };
    }
</script>

{#if $showAttachmentPickerPanel}
<div class="wrapper" use:attachmentsClickHandler transition:fly={{y: 10, duration: 100}}>
    <div class="attachmentContainer">
        <!-- File Choose -->
        <div transition:scale={{duration: 100}}
            class="upload_file button-animate btn icon play-sound attachmentButton"
        >
            <label
                for="fileChooser"
                class="file-input-label"
                title="Choose files [Alt+f]"
                ><i class="fa-regular fa-file-lines fa-shake" /></label
            >
            <input type="file" multiple name="file" id="fileChooser" />
            <div class="text">File</div>
        </div>
        <!-- Image Choose -->
        <div transition:scale={{duration: 150}}
            class="upload_image button-animate btn icon play-sound attachmentButton"
        >
            <label for="photoChooser" title="Choose Photos [Alt+p]"
                ><i class="fa-regular fa-image fa-shake" /></label
            >
            <input
                type="file"
                multiple
                name="photo"
                id="photoChooser"
                accept="image/png, image/jpg, image/jpeg, image/gif"
            />
            <div class="text">Image</div>
        </div>

        <!-- Audio Choose -->
        <div transition:scale={{duration: 200}}
            class="upload_audio button-animate btn icon play-sound attachmentButton"
        >
            <label for="audioChooser" title="Choose Music [Alt+m]"
                ><i class="fa-solid fa-music fa-shake" /></label
            >
            <input
                type="file"
                multiple
                name="audio"
                id="audioChooser"
                accept="audio/*"
            />
            <div class="text">Audio</div>
        </div>

        <!-- Location input -->
        <div transition:scale={{duration: 250}}
            class="location button-animate btn icon play-sound attachmentButton"
            id="send-location"
        >
            <button on:click={transmitLocation}>
                <i class="fa-solid fa-location-crosshairs fa-shake" />
            </button>
            <div class="text">Location</div>
        </div>
        <!-- Poll -->
        <!--div class="poll button-animate btn play-sound" id="createPollBtn">
            <i class="fa-solid fa-square-poll-horizontal"></i>
            <div class="text">Poll</div>
        </!div-->
    </div>
</div>
{/if}

<style lang="scss">
    .wrapper {
        top: 0;
        left: 0;
        right: 0;
        position: fixed;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 20;
        width: 100%;
        height: 100%;
        transition: 100ms ease-in-out;
        backdrop-filter: brightness(0.8);

        .attachmentContainer {
            position: absolute;
            bottom: 70px;
            padding: 20px;
            border-radius: 10px;
            display: flex;
            gap: 20px;
            flex-direction: row;
            align-items: flex-start;
            justify-content: center;
            width: max-content;
            background: var(--primary-dark);
            filter: drop-shadow(0 4px 5px black);
            z-index: 20;
            transform-origin: bottom;
            transition: 200ms;

            .attachmentButton {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 10px;
                position: relative;
                transition: 200ms;

                label,
                button {
                    position: relative;
                    padding: 10px;
                    width: 50px;
                    height: 50px;
                    border-radius: 55px;
                    display: grid;
                    place-items: center;
                    background: var(--secondary-dark);
                    cursor: pointer;
                }

                .text {
                    font-size: 0.7rem;
                }

                input {
                    display: none;
                }
            }
        }
    }
</style>
