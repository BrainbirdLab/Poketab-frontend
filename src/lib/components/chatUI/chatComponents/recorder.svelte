<script lang="ts">
    import { showToastMessage } from "$lib/components/toast";


    import { voiceMessageAudio } from "$lib/messageTypes";

    let recorderActive = false;
    let recordingState = false;
    let playState = false;

    let micIcon = 'fa-microphone';

    let time = '00:00';

    let timer: number | null = null;

    let audioStream: MediaStream;

    let audioRecorder: MediaRecorder;

    let audioChunks: Blob[] = [];

    let audioUrl = '';

    let audioDuration = 0;
    let elapsedTime = 0;

    export function getDuration(){
        return audioDuration;
    }

    function timeToPrintable(time: number){
        let minutes = Math.floor(time / 60);
        let seconds = Math.floor(time % 60);
        return `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
    }

    function updateRecordingTimer(){
        timer = setInterval(()=>{
            time = timeToPrintable(++elapsedTime);
        }, 1000);
    }

    function updatePlayingTimer(){

        if (!$voiceMessageAudio){
            return;
        }

        const remainingTime = audioDuration - Math.round($voiceMessageAudio.currentTime);
        time = timeToPrintable(remainingTime);
    }

    function playAudio(){
        micIcon = 'fa-pause';

        // play audio
        if ($voiceMessageAudio){
            $voiceMessageAudio.play();
            $voiceMessageAudio.ontimeupdate = () => {
                if (!$voiceMessageAudio){
                    return;
                }
                const progress = $voiceMessageAudio.currentTime / audioDuration;
                document.documentElement.style.setProperty('--recordedAudioPlaybackProgress', `${progress * 100}%`);
                updatePlayingTimer();
            };
            $voiceMessageAudio.onended = () => {
                if (!$voiceMessageAudio){
                    return;
                }
                console.log('Audio ended');
                micIcon = 'fa-play';
                time = timeToPrintable(audioDuration);
                document.documentElement.style.setProperty('--recordedAudioPlaybackProgress', `0%`);
                $voiceMessageAudio.ontimeupdate = null;
            };
        } else {
            console.log('Audio is not available');
        }
    }

    function pauseAudio(){
        micIcon = 'fa-play';

        if ($voiceMessageAudio){
            $voiceMessageAudio.pause();
        } else {
            console.log('Audio is not available');
        }
    }

    function startRecording(){
        
        // start recording
        navigator.mediaDevices.getUserMedia({audio: true})
        .then(mediaStream => {
                console.log('Recording started');
                recorderActive = true;
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
                    console.log('Recording stopped');

                    const audioBlob = new Blob(audioChunks, {type: 'audio/mp3'});
                    audioUrl = URL.createObjectURL(audioBlob);

                   voiceMessageAudio.set(new Audio(audioUrl));

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
        // console.log('Record button clicked');
        // this plays role to show the recorder, start recording, stop recording, play and pause the recorded audio
        // if the recorder is not active, it will be activated
        if (!recorderActive){
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

    export function closeRecorder(){
        // close recorder if it is active
        if (recordingState){
            stopRecording();
        }

        //if audio
        if ($voiceMessageAudio){
            $voiceMessageAudio.pause();
            $voiceMessageAudio.currentTime = 0;
            
            voiceMessageAudio.set(null);

            URL.revokeObjectURL(audioUrl);
        }

        time = '00:00';
        elapsedTime = 0;
        audioDuration = 0;
        if (timer){
            clearInterval(timer);
        }
        recorderActive = false;
        micIcon = 'fa-microphone';
        playState = false;
    }

</script>

<!-- Microphone -->
<div class="voiceRecorder" class:active={recorderActive} id="recorderOverlay" data-recordingstate="{recordingState}">
    <div class="container">
        <button class="recordBtn btn button-animate small btn roundedBtn hover hoverShadow" id="recordVoiceButton" data-playstate="{playState}" title="Record voice [Alt+r]" on:click={recordButtonHandler}>
            <i class="fa-solid {micIcon}" id="micIcon"></i>
        </button>
        <div class="recording">
            {#if recordingState}
            <span class="recordingText"><i class="fa-solid fa-circle recordIcon"></i></span>
            {/if}
            <span id="recordingTime" class="recordingTime">{time}</span>
        </div>
        <button class="cancelBtn btn button-animate btn small play-sound roundedBtn hover hoverShadow" id="cancelVoiceRecordButton" on:click={closeRecorder}>
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
            background: var(--primary-dark);
            #audiovisualizer {
                background: rgba(255, 255, 255, 0.0509803922);
            }
        }

        &::before {
            position: absolute;
            content: "";
            height: 100%;
            width: var(--recordedAudioPlaybackProgress, 0);
            background: rgba(0, 0, 0, 0.1490196078);
            z-index: -1;
        }

        .container{
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            pointer-events: all;
        }

        .recording {
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: row;
            gap: 5px;
            pointer-events: none;
            .recordingText {
                display: flex;
                align-items: center;
                justify-content: center;
                .recordIcon {
                    font-size: 0.6rem !important;
                    color: var(--red);
                    animation: blink 0.5s infinite alternate;
                }
            }
            .recordingTime {
                font-size: 0.8rem;
            }
        }

        .btn {
            margin: 5px;
            padding: 10px 15px;
            display: flex;
            align-items: center;
            justify-content: center;
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