<div class="audioPlayer">
    <div class="controls flex a-c j-c">
        <i class="control fa-solid fa-pause"></i>
    </div>
    <div class="progress-container">
        <div class="progressBar"></div>
    </div>
    <div class="time">01:27</div>
</div>

<style lang="scss">
    .audioPlayer {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        background: var(--highlight);
        border-radius: 25px;
        padding: 6px;
        height: 35px;
        width: 200px;
        position: relative;
        overflow: hidden;
        .progress-container {
            position: relative;
            width: 100%;
            height: 50%;
            display: flex;
            align-items: center;
            justify-content: flex-start;
        }

        .progressBar {
            position: relative;
            width: 100%;
            height: 2px;
            background: var(--glass-color);
            pointer-events: none;
            &::after {
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                height: 100%;
                width: 44%;
                max-width: 100%;
                pointer-events: none;
                background: var(--transparent-white-color);
                z-index: 2;
            }
        }

        .controls {
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2;
            background: var(--text-color);
            border-radius: 25px;
            height: 23px;
            width: 23px;
            min-width: 23px;
            min-height: 23px;
            max-height: 23px;
            max-width: 23px;
            aspect-ratio: 1 / 1;
        }

        .control {
            font-size: 12px;
            width: 20px;
            height: 20px;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--highlight) !important;
            z-index: 2;
        }

        i {
            font-size: 0.8rem;
        }
        .time {
            font-size: 0.6rem;
            color: var(--highlight);
            background: var(--text-color);
            border-radius: 25px;
            padding: 1px 5px;
            height: max-content;
            width: 40px;
            margin-right: 3px;
        }
    }
</style>
