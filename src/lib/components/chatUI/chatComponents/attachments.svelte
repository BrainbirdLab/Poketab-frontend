<script lang="ts">
    import { fly, scale } from "svelte/transition";
    import { showAttachmentPickerPanel } from "$lib/components/modalManager";
    import { showToastMessage } from "$lib/components/toast";
    import { socket } from "$lib/components/socket";
    import { chatRoomStore, myId } from "$lib/store";
    import { selectedFiles } from "$lib/messageTypes";
    import { tick } from "svelte";
    import FilePreview from "./filePreview.svelte";

    let locationBtn: HTMLButtonElement;
    let fileBtn: HTMLButtonElement;
    let imageBtn: HTMLButtonElement;
    let audioBtn: HTMLButtonElement;

    let filePicker: HTMLInputElement;
    let showFilePicker = false;

    let acceptedTypes: null | 'image/png, image/jpg, image/jpeg' | 'audio/mp3, audio/wav, audio/ogg' = null;
    let type: 'file' | 'image' | 'audio' = 'file';


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
            socket.emit('location', {latitude, longitude}, $chatRoomStore.Key, $myId);
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

        const clickHandler = async (e: Event) => {

            const target = e.target as HTMLElement;

            console.log(target);
            
            if (target === fileBtn){
                acceptedTypes = null;
                type = 'file';
            } else if (target === imageBtn){
                acceptedTypes = 'image/png, image/jpg, image/jpeg';
                type = 'image';
            } else if (target === audioBtn){
                acceptedTypes = 'audio/mp3, audio/wav, audio/ogg';
                type = 'audio';
            } else if (target === locationBtn){
                transmitLocation();
                return;
            }

            if (target === node || target === fileBtn || target === imageBtn || target === audioBtn){
                if (target !== node){
                    showFilePicker = true;
                    await tick();
                    filePicker.onchange = (e) => {
                        console.log('filePicker change event');
                        if ($selectedFiles.length > 10){
                            showToastMessage('You can only send 10 files at a time.');
                            clearInput();
                            return;
                        }
                    }
                    filePicker.click();
                }
                showAttachmentPickerPanel.set(false);
            }
        };

        node.onclick = clickHandler;

        return {
            destroy() {
                node.onclick = null;
            },
        };
    }

    function clearInput() {
        filePicker.value = '';
        filePicker.files = null;

        //trigger change event
        filePicker.dispatchEvent(new Event('change'));

        showFilePicker = false;
    }

    function deleteItem(e: CustomEvent<number>) {

        if (!filePicker.files){
            return;
        }

        if (filePicker.files.length === 1){
            clearInput();
            return;
        }
        //use fileList to remove item
        const fileList = new DataTransfer();
        for (let i = 0; i < filePicker.files.length; i++) {
            if (i !== e.detail){
                fileList.items.add(filePicker.files[i]);
            }
        }
        filePicker.files = fileList.files;
        filePicker.dispatchEvent(new Event('change'));
    }

</script>

<FilePreview bind:type={type} on:fileClear={clearInput} on:fileRemove={deleteItem}/>

{#if showFilePicker}
    <input multiple bind:files={$selectedFiles} type="file" bind:this={filePicker} accept="{acceptedTypes}"/>
{/if}

{#if $showAttachmentPickerPanel}
<div class="wrapper" use:attachmentsClickHandler transition:fly={{y: 30, duration: 150}}>
    <div class="attachmentContainer">
        <!-- File Choose -->
        <div transition:scale={{duration: 100, start: 0.5}}
            class="upload_file button-animate btn icon play-sound attachmentButton"
        >
            <button bind:this={fileBtn}>
                <i class="fa-regular fa-file-lines fa-shake" />
            </button>
            <div class="text">File</div>
        </div>
        <!-- Image Choose -->
        <div transition:scale={{duration: 150}}
            class="upload_image button-animate btn icon play-sound attachmentButton"
        >
            <button bind:this={imageBtn}>
                <i class="fa-regular fa-image fa-shake" />
            </button>
            <div class="text">Image</div>
        </div>

        <!-- Audio Choose -->
        <div transition:scale={{duration: 200}}
            class="upload_audio button-animate btn icon play-sound attachmentButton"
        >
            <button bind:this={audioBtn}>
                <i class="fa-solid fa-music fa-shake" />
            </button>
            <div class="text">Audio</div>
        </div>

        <!-- Location input -->
        <div transition:scale={{duration: 250}}
            class="location button-animate btn icon play-sound attachmentButton"
        >
            <button bind:this={locationBtn}>
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

    input[type="file"] {
        display: none;
    }

    @mixin flex-column-center {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    @mixin flex-row-center {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
    }

    .wrapper {
        top: 0;
        left: 0;
        right: 0;
        position: fixed;

        @include flex-column-center;

        z-index: 20;
        width: 100%;
        height: 100%;
        transition: 100ms ease-in-out;
        backdrop-filter: brightness(0.8);

        .attachmentContainer {
            position: absolute;
            bottom: 80px;
            padding: 20px;
            border-radius: 10px;
            display: flex;
            gap: 20px;
            @include flex-row-center;
            width: max-content;
            background: var(--primary-dark);
            filter: drop-shadow(0 4px 5px var(--shadow));
            z-index: 20;
            transform-origin: bottom;
            transition: 200ms;

            .attachmentButton {
                display: flex;
                @include flex-column-center;
                gap: 10px;
                position: relative;
                transition: 200ms;

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

                    i{
                        pointer-events: none;
                    }
                }

                .text {
                    font-size: 0.7rem;
                }
            }
        }
    }
</style>
