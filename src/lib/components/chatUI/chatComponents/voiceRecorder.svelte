<script context="module" lang="ts">
    
    import { type Writable, writable } from 'svelte/store';

    export const recordedAudioUrl: Writable<string> = writable('');
    export const recorderIsActive: Writable<boolean> = writable(false);
</script>

<script lang="ts">
    import { showToastMessage } from "@itsfuad/domtoastmessage";

    import { playMessageSound } from "$lib/utils";
    import Mirage from "$lib/components/icons/mirage.svelte";

    
    let recordingState = false;
    let playState = false;

    let micIcon = 'fa-microphone';

    let time = '00:00';

    let timer: number | NodeJS.Timeout | null = null;

    let audioStream: MediaStream;

    let audioRecorder: MediaRecorder;

    let audioChunks: Blob[] = [];


    let audioDuration = 0;
    let elapsedTime = 0;

    let recordedAudio: HTMLAudioElement | null;

    export function getDuration(){
        return audioDuration;
    }

    function timeToPrintable(time: number){
        let minutes = Math.floor(time / 60);
        let seconds = Math.floor(time % 60);

        if (minutes < 0){
            minutes = 0;
        }

        if (seconds < 0){
            seconds = 0;
        }

        return `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
    }

    function updateRecordingTimer(){
        timer = setInterval(()=>{
            time = timeToPrintable(++elapsedTime);
        }, 1000);
    }

    function updatePlayingTimer(){

        if (!recordedAudio){
            return;
        }

        const remainingTime = audioDuration - Math.round(recordedAudio.currentTime);
        time = timeToPrintable(remainingTime);
    }

    function playAudio(){
        micIcon = 'fa-pause';

        // play audio
        if (recordedAudio){
            recordedAudio.play();
            recordedAudio.ontimeupdate = () => {
                if (!recordedAudio){
                    return;
                }
                const progress = recordedAudio.currentTime / audioDuration;
                document.documentElement.style.setProperty('--recordedAudioPlaybackProgress', `${progress * 100}%`);
                updatePlayingTimer();
            };
            recordedAudio.onended = () => {
                if (!recordedAudio){
                    return;
                }
                micIcon = 'fa-play';
                time = timeToPrintable(audioDuration);
                document.documentElement.style.setProperty('--recordedAudioPlaybackProgress', "0%");
                recordedAudio.ontimeupdate = null;
            };
        } else {
            console.log('Audio is not available');
            showToastMessage('Audio data not loaded yet');
        }
    }

    function pauseAudio(){
        micIcon = 'fa-play';

        if (recordedAudio){
            recordedAudio.pause();
        } else {
            console.log('Audio is not available');
            showToastMessage('Audio data not loaded yet');
        }
    }

    function startRecording(){
        
        // start recording
        navigator.mediaDevices.getUserMedia({audio: true})
        .then(mediaStream => {
                playMessageSound('startRecording');
                recorderIsActive.set(true);
                recordingState = true;
                playState = false;
                micIcon = 'fa-stop';
                audioStream = mediaStream;
                audioRecorder = new MediaRecorder(audioStream);

                //start recording timer
                updateRecordingTimer();

                audioRecorder.ondataavailable = (evt) => {
                    audioChunks.push(evt.data);
                };

                audioRecorder.onstop = () => {

                    const audioBlob = new Blob(audioChunks, {type: 'audio/mp3'});

                    recordedAudioUrl.set(URL.createObjectURL(audioBlob));
                    console.log('Audio url set after recording');
                    recordedAudio = new Audio($recordedAudioUrl);

                    audioRecorder.ondataavailable = null;
                };

                audioRecorder.start();

        }).catch((err: MediaError) => {
            console.log(err.message);
            showToastMessage(err.message);
        });
    }

    function stopRecording(){
        recordingState = false;
        playState = true;
        micIcon = 'fa-play';

        // stop timer if it is running
        if (timer){
            clearInterval(timer);
            audioDuration = elapsedTime;
        }

        audioRecorder?.stop();
        audioStream?.getTracks().forEach(track => track.stop());
        audioChunks = [];
    }

    function recordButtonHandler(){
        // this plays role to show the recorder, start recording, stop recording, play and pause the recorded audio
        // if the recorder is not active, it will be activated
        if (!$recorderIsActive){
            startRecording();
        } else {
            if (playState){
                if (micIcon == 'fa-play'){
                    playAudio();
                } else {
                    pauseAudio();
                }
            } else {
                stopRecording();
            }
        }
    }

    export function closeRecorder(revoke: boolean){

        // close recorder if it is active
        if (recordingState){
            audioRecorder.onstop = null;
            stopRecording();
        }

        //if audio
        if (recordedAudio){

            if (revoke){
                URL.revokeObjectURL($recordedAudioUrl);
            }

            recordedAudio.pause();
            recordedAudio.currentTime = 0;
            
            recordedAudio = null;
        }
        
        recordedAudioUrl.set('');
        time = '00:00';
        elapsedTime = 0;
        audioDuration = 0;
        if (timer){
            clearInterval(timer);
        }
        recorderIsActive.set(false);
        micIcon = 'fa-microphone';
        playState = false;
        if (document){
            document.documentElement.style.setProperty('--recordedAudioPlaybackProgress', "0%");
        }
    }

</script>

<!-- Microphone -->
<div class="voiceRecorder" class:active={$recorderIsActive} data-a="{$recorderIsActive}" id="recorderOverlay" data-recordingstate="{recordingState}">
    <div class="container">
        <button class="recordBtn button-animate roundedBtn hover hoverShadow" id="recordVoiceButton" data-playstate="{playState}" title="Record voice [Alt+r]" on:click={recordButtonHandler}>
            <i class="fa-solid {micIcon}" id="micIcon"></i>
        </button>
        <div class="recording">
            {#if recordingState}
            <Mirage />
            {/if}
            <span id="recordingTime" class="recordingTime">{time}</span>
        </div>
        <button class="cancelBtn button-animate play-sound roundedBtn hover hoverShadow" id="cancelVoiceRecordButton" on:click={() => {closeRecorder(true)}}>
            <i class="fa-solid fa-xmark"></i>
        </button>
        <div id="audiovisualizer"></div>
    </div>
</div>

<style lang="scss">
    .voiceRecorder {
        gap: 10px;
        display: flex;
        align-items: flex-end;
        justify-content: flex-start;
        flex-direction: row;
        background: none;
        position: absolute;
        height: 100%;
        width: 45px;
        right: 0;
        overflow: hidden;
        transition: 300ms ease-in-out;
        z-index: 2;
        isolation: isolate;
        transform: translateY(0px);
        opacity: 1;
        visibility: visible;
        &.active {
            width: 100%;
            //background: var(--modal-color);

            .recording{
                opacity: 1;
            }

            #audiovisualizer {
                background: rgba(255, 255, 255, 0.05);
            }
        }

        &::before {
            position: absolute;
            content: "";
            height: 100%;
            width: var(--recordedAudioPlaybackProgress, 0);
            background: rgba(0, 0, 0, 0.15);
            z-index: -1;
        }

        .container{
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            inset: 0;
            padding: 5px;
            pointer-events: all;
        }

        .recording {
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: row;
            gap: 5px;
            pointer-events: none;
            transition: 200ms ease-in-out;
            opacity: 0;
            .recordingText {
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .recordingTime {
                font-size: 0.8rem;
                position: absolute;
            }
        }

        #audiovisualizer {
            position: absolute;
            background: transparent;
            height: var(--amplitude, 0);
            width: var(--amplitude, 0);
            border-radius: 50%;
            left: 50%;
            transform: translateX(-50%);
            z-index: -1;
            transition: 50ms ease-in-out;
            pointer-events: none;
        }

        &[data-recordingstate=false] #audiovisualizer {
            height: 0;
            width: 0;
        }
    }
</style>