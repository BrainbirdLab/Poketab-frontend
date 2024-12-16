<script lang="ts">
    import { fade, fly, scale } from "svelte/transition";
    import { showToastMessage } from "@itsfuad/domtoastmessage";
    import { socket } from "$lib/connection/socketClient";
    import { chatRoomStore, myId } from "$lib/store.svelte";
    import { AudioMessageObj, FileMessageObj, ImageMessageObj, selectedFiles } from "$lib/messageStore.svelte";
    import { tick } from "svelte";
    import FilePreview from "./filePreview.svelte";
    import { sendMessage } from "./messages/messageUtils";
    import { page } from "$app/stores";

    interface Props {
        showFilePicker: boolean;
        sendAsType: "file" | "image" | "audio";
    }
    let { showFilePicker = $bindable(), sendAsType = $bindable() }: Props = $props();

    let locationBtn = $state() as HTMLButtonElement;
    let fileBtn = $state() as HTMLButtonElement;
    let imageBtn = $state() as HTMLButtonElement;
    let audioBtn = $state() as HTMLButtonElement;

    let filePicker = $state() as HTMLInputElement;

    let acceptedTypes: null | 'image/png, image/jpg, image/jpeg' | 'audio/mp3, audio/wav, audio/ogg' = $state(null);

    let urlObjects: Map<string, string> = $state(new Map());

    function transmitLocation() {

        if (!navigator.geolocation){
            showToastMessage('Geolocation is not supported by this browser.');
        }

        //try to get location with high accuracy and timeout of 5 seconds.
        let timeout = setTimeout(() => {
            showToastMessage('Unable to get location.');
        }, 5000);

        navigator.geolocation.getCurrentPosition((position) => {
            clearTimeout(timeout);
            const {latitude, longitude} = position.coords;
            socket.emit('location', {latitude, longitude}, chatRoomStore.value.Key, myId.value);
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

            try{
                if (target === fileBtn){
                    acceptedTypes = null;
                    sendAsType = 'file';
                } else if (target === imageBtn){
                    acceptedTypes = 'image/png, image/jpg, image/jpeg';
                    sendAsType = 'image';
                } else if (target === audioBtn){
                    acceptedTypes = 'audio/mp3, audio/wav, audio/ogg';
                    sendAsType = 'audio';
                } else if (target === locationBtn){
                    transmitLocation();
                    return;
                }
    
                if (target === node || target === fileBtn || target === imageBtn || target === audioBtn || target === locationBtn){
                    if (target !== node){
                        showFilePicker = true;
                        await tick();
                        filePicker.onchange = (e) => {
                            if (selectedFiles.value && selectedFiles.value.length > 10){
                                showToastMessage('You can only send 10 files at a time.');
                                clearInput();
                                return;
                            }
                        }
                        filePicker.click();
                    }
                }
            } catch (e) {
                console.error(e);
            } finally {
                history.back();
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
        if (filePicker){
           //use DataTransfer to clear files
            filePicker.files = new DataTransfer().files;
            filePicker.dispatchEvent(new Event('change'));
        }

        showFilePicker = false;
    }

    function deleteItem(id: number) {

        if (!filePicker?.files){
            return;
        }

        if (filePicker.files.length === 1){
            clearInput();
            return;
        }
        //use fileList to remove item
        const fileList = new DataTransfer();
        for (let i = 0; i < filePicker.files.length; i++) {
            if (i !== id){
                fileList.items.add(filePicker.files[i]);
            }
        }
        filePicker.files = fileList.files;
        filePicker.dispatchEvent(new Event('change'));
    }

    function sendFiles() {

        if (!selectedFiles.value || selectedFiles.value.length === 0){
            return;
        }

        //copy files to variable
        const files = [...selectedFiles.value];

        //clear input
        clearInput();

        //send files metadata via socket and send files via xhr separately with promise.all
        const promisses = files.map((file) => {
            return new Promise( async (resolve, reject) => {

                let message: FileMessageObj | ImageMessageObj | AudioMessageObj;

                if (sendAsType !== 'audio'){
                    
                    if (sendAsType === 'file'){
                        message = new FileMessageObj();
                    } else {
                        message = new ImageMessageObj();
                    }
                    
                    message.sender = myId.value;
                    message.size = file.size;
                    message.type = file.type;
                    message.name = file.name;
                    message.loadScheme = 'upload';
                    message.url = urlObjects.get(file.name) || URL.createObjectURL(file); // Use urlObjects if it exists, otherwise create new objectURL
                    
                    if (message instanceof ImageMessageObj) {
                        const thumbnail = await makeThumbnailFromImage(file, 40);
                        message.thumbnail = thumbnail.url;
                        message.width = thumbnail.width;
                        message.height = thumbnail.height;
                        
                        await sendMessage(message, file);

                    } else {
                        await sendMessage(message, file);
                    }

                } else {

                    message = new AudioMessageObj();

                    if (message instanceof AudioMessageObj) { // Here we used this to make typescript happy

                        message.sender = myId.value;
                        message.size = file.size;
                        message.name = file.name;
                        message.audio = new Audio();
                        message.loadScheme = 'upload';
                        message.audio.src = urlObjects.get(file.name) || URL.createObjectURL(file); // Use urlObjects if it exists, otherwise create new objectURL

                        (message as AudioMessageObj).audio.addEventListener('loadedmetadata', async () => {
                            if (message instanceof AudioMessageObj) {
                                message.duration = message.audio.duration;

                                await sendMessage(message, file);
                            }
                        }, { once: true });
                        
                    }
                }
            });
        });

        Promise.allSettled(promisses).catch((err) => {
            console.log(err);
            showToastMessage('Unable to send files.');
        });
    }

    function handleClick(node: HTMLElement){

        node.onclick = (e: Event) => {
            const target = e.target as HTMLElement;
            if (target.tagName === "BUTTON"){
                if (target.id === "cancel"){
                    clearInput();
                } else if (target.id === "send"){
                    sendFiles();
                }
            } else if (target.tagName === "I" && target.classList.contains("remove")){
                const elem = target.closest('.file_preview') as HTMLElement;
                if (!elem){
                    return;
                }
                const id = elem.dataset.id;
                if (id == null){
                    return;
                }
                deleteItem(+id);
            }
        }

        return {
            destroy(){
                node.onclick = null;
            }
        }
    }

    function makeThumbnailFromImage(file: File, resolution: number, blurAmount: number = 15): Promise<{url: string, width: number, height: number}>{
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    if (!ctx){
                        reject('Unable to create canvas.');
                        return;
                    }
                    // Keep aspect ratio
                    const ratio = img.width / img.height;
                    const originalWidth = img.width;
                    const originalHeight = img.height;
                    let width = resolution;
                    let height = resolution;
                    if (ratio > 1){
                        height = resolution / ratio;
                    } else {
                        width = resolution * ratio;
                    }
                    canvas.width = width;
                    canvas.height = height;
                    
                    // Draw the image on the canvas
                    ctx.drawImage(img, 0, 0, width, height);

                    // Apply blur filter
                    ctx.filter = `blur(${blurAmount}px)`;

                    // Draw the blurred image back on the canvas
                    ctx.drawImage(canvas, 0, 0, width, height);

                    // Reset the filter
                    ctx.filter = 'none';

                    resolve({
                        url: canvas.toDataURL(),
                        width: originalWidth,
                        height: originalHeight
                    });
                }
                img.src = e.target?.result as string;
            }
            reader.readAsDataURL(file);
        });
    }

    const ready = true;

</script>



{#if selectedFiles.value && selectedFiles.value.length > 0}
<div class="filePreviewContainer" use:handleClick in:fade={{duration: 100}} out:fade={{duration: 200}}>
    <FilePreview bind:sendAsType={sendAsType} bind:urlObjects={urlObjects}/>
</div>
{/if}

{#if true}
    <input multiple bind:files={selectedFiles.value} type="file" bind:this={filePicker} accept="{acceptedTypes}"/>
{/if}

{#if $page.state.showAttachmentPickerPanel === true}
<div class="wrapper" use:attachmentsClickHandler transition:fly={{y: 30, duration: 150}}>
    {#if ready}
    <div class="attachmentContainer back-blur box-shadow">
        <!-- File Choose -->
        <div transition:scale={{duration: 100, start: 0.5}}
            class="upload_file button-animate icon play-sound attachmentButton"
        >
            <button aria-label="file" bind:this={fileBtn}>
                <i class="fa-regular fa-file-lines"></i>
            </button>
            <div class="text">File</div>
        </div>
        <!-- Image Choose -->
        <div transition:scale={{duration: 150}}
            class="upload_image button-animate icon play-sound attachmentButton"
        >
            <button aria-label='image' bind:this={imageBtn}>
                <i class="fa-regular fa-image"></i>
            </button>
            <div class="text">Image</div>
        </div>

        <!-- Audio Choose -->
        <div transition:scale={{duration: 200}}
            class="upload_audio button-animate icon play-sound attachmentButton"
        >
            <button aria-label="music" bind:this={audioBtn}>
                <i class="fa-solid fa-music"></i>
            </button>
            <div class="text">Audio</div>
        </div>

        <!-- Location input -->
        <div transition:scale={{duration: 250}}
            class="location button-animate icon play-sound attachmentButton"
        >
            <button aria-label="location" bind:this={locationBtn}>
                <i class="fa-solid fa-location-crosshairs"></i>
            </button>
            <div class="text">Location</div>
        </div>
        <!-- Poll -->
        <!--div class="poll button-animate play-sound" id="createPollBtn">
            <i class="fa-solid fa-square-poll-horizontal"></i>
            <div class="text">Poll</div>
        </!div-->
    </div>
    {:else}
        Not ready yet
    {/if}
</div>
{/if}

<style lang="scss">

    input[type="file"] {
        display: none;
    }

    .filePreviewContainer {
        position: fixed;
        bottom: 0;
        left: 0;
        height: 100%;
        width: 100%;
        background-image:
            url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQQAAAEECAYAAADOCEoKAAAgAElEQVR4nNSdB7R9RXX/51eoClItoIiCVAk1NgKCAsFY8zdApGkUiIYggq5YUAELFhSIdanBhQIRRcQoQUoENIodEAQUVKpIk6o037vzX5/hfK/77d/MOXPOve8H2Wvd9co9ZWbPnt33nnDBBRfEEELcbLPN4uzsbByNRukzCcz8eSbdrefx90MPPTR+Ln/rOwv276uuuipefPHFE40jBxoPP48//vg095e+9KXjcel7jfGtb31rXLBgQXzLW95S9Ww/pwcffDDuvPPOceHChfFxj3tc/NGPfpSeq08Nri+55JK47LLLprGef/75S7yH5+Tg9ttvj7feemsWz3q/gOcyz0022WTOOk1KD8Kn4P7775/zfvt9bh5XX311mn909FF6V59x8T7eLTp4yUteMgcvllbe/OY3J/xAD4Doueuj+5n33/7t36b3rLLKKvEnP/lJ9ViFH/bDMsssk55x3nnnLTEXv780D2iATzQ0WlrXhaPRKCxYsCAsXLgwAPzOZwjEGNNnwcKH7+eZt912W7jv/vvCokWLxs/l+ziK4791H/DnP/85/Vx//fXD5ptvPmgcbTAew4IFYcUVVky/P/TQQ+n9s6PZ9P9FixeFmdmZNP4777wz/XzMYx4zZ6y5TzDP11z22GOPcO6554blllsufPWrXw3bbLNNmjvP5NOFa9bn2GOPTWN80YteFJ7//OePv5udmU3fA7feemvYfvvtwzHHHJP+x3hWXnnl8LjHPS69I82vuT6tUbPOGree49dpEnoQPsDnzTffHP74xz+G5Zdf/i/rPnr43XwfGnrxAB381V/91RK4tWDppy8sXLQwLLvssukucGzXxP584IEH0jtYR34KT10f5sb1e+25V6KDFVdcMXz5y19OdFAD0BBjBI477rj098te9rKwww47zFl/jQM62GnnncLHPvaxMT5XX3319LHXFdf13HPPTZxvyy23nFgz8BwN7r7CCivEddZZJ3FWuKKVFlYCWY41LU2lbXw8+6KLLkrcFumN5Na79f7bbrstPuUpT4mLFi2KX//616ufr2f8v7//f+n5yy23XDzjjDPG3/UBSQXW6Dvf+c4SuEIDAS688MI0jyc/+cnx3nvvTe/RdwIr1SwugLPPPjuNdautthp/Ny38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");
        background-repeat: repeat;
        background-color: var(--modal-color);
        background-blend-mode: multiply;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 5px;
        z-index: 110;
        transition: 100ms ease-in-out;
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
        
        @include flex-column-center;
        
        inset: 0;
        z-index: 20;
        width: 100%;
        height: 100%;
        position: fixed;
        transition: 100ms ease-in-out;
        //backdrop-filter: brightness(0.8);

        .attachmentContainer {
            position: absolute;
            bottom: 40px;
            padding: 20px;
            border-radius: 10px;
            display: flex;
            gap: 20px;
            @include flex-row-center;
            width: max-content;
            background: var(--modal-color);
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
                    color: var(--transparent-white-color);
                }
            }
        }
    }
</style>
