<script lang="ts">
    import Arrow from "$lib/components/landing/arrow.svelte";
    import Word from "$lib/components/landing/word.svelte";
    import Img from "$lib/components/landing/img.svelte";
    import Pdf from "$lib/components/landing/pdf.svelte";
    import Lines from "$lib/components/landing/lines.svelte";
    import { showToastMessage } from "@itsfuad/domtoastmessage";
    import { onMount } from "svelte";
    import { fade, fly } from "svelte/transition";

    const version = __VERSION__;

    let mounted = false;

    onMount(() => {
        mounted = true;
    });

    function handleCopy() {
        navigator.clipboard.writeText(
            "0x736Cc7836fF2A6988Ae0f25678Ce7640B71E7f04",
        );
        showToastMessage("Copied to clipboard");
    }

    const brands = [
        'fa-chrome',
        'fa-apple',
        'fa-android',
        'fa-windows',
        'fa-ubuntu',
    ]

</script>

<svelte:head>
  <title>
    Poketab Messenger
  </title>
</svelte:head>

{#if mounted}
    <div class="wrapper ball-open">
        <div class="container">
            <main class="hero-container">
                <section class="flex row-rev wrap a-c j-c">
                    <img
                        class="landing-img"
                        src="/images/pikachu-landing.png"
                        alt="landing"
                    />
                    <div class="hero short-width flex col">
                        <div class="title flex col j-c">
                            <div class="titleText" in:fly={{x: -10}}>
                                The most cutest messenger you have ever seen
                            </div>
                            <div class="version flex row" in:fly={{y: 5, delay: 200}}>
                                <div class="v">v.{version}</div>
                                <div class="f">Free and opensource</div>
                            </div>
                        </div>
                        <div class="about flex row-rev wrap a-c j-c" in:fade={{delay: 300}}>
                            <div class="txt">
                                Experience secure communication with robust
                                encryption that ensures only you and your
                                recipient can access your messages. Our platform
                                safeguards your privacy, keeping your data
                                confidential and protected against unauthorized
                                access—just like a Pokéball keeps Pokémon safe.
                            </div>
                        </div>
                        <div class="links" in:fly={{y: 5, delay: 300}}>
                            <a
                                id="login"
                                class="button-animate button play-sound"
                                href="/chat">Start Chat</a
                            >
                            <a
                                id="github"
                                class="button-animate button play-sound"
                                href="https://github.com/BrainbirdLab/Poketab-Frontend"
                                >Source code
                                <i
                                    class="fa-solid fa-arrow-up-right-from-square"
                                ></i>
                            </a>
                        </div>
                        <div class="consent" in:fade={{delay: 500}}>
                            By using Poketab Messenger, you agree to our <a
                                href="/terms">Terms of Service</a
                            >
                            and <a href="/privacy">Privacy Policy</a>.
                        </div>
                    </div>
                </section>

                <div class="platforms flex wrap row a-c j-c">
                    {#each brands as brand, i (i)}
                        <i class="fa-brands {brand}" in:fly|global={{y: -10, delay: (100*i) + 400}}></i>
                    {/each}
                </div>
            </main>
            <section class="top-feature flex col a-c j-c" in:fly={{y: 10, delay: 400}}>
                <div class="card flex col">
                    <div class="tag top flex row a-c j-c">Top</div>
                    <div class="content flex row wrap a-c j-sa">
                        <div class="main flex col a-c j-c">
                            <h3 class="big-title">
                                Insane security system for every messages
                            </h3>
                            <p class="des">
                                Unique crypto-key for every messages. No one can
                                read your messages except you and the person
                                you're communicating with.
                            </p>
                        </div>
                        <div class="img">
                            <Lines />
                        </div>
                    </div>
                    <div class="learn">
                        <a
                            href="https://itsfuad.medium.com/encrypting-and-decrypting-messages-with-symmetric-key-8e8021fe11d4"
                            target="_blank">Learn more</a
                        >
                    </div>
                </div>
            </section>
            <!-- Features -->
            <section class="full-width">
                <div class="features-container flex col a-c j-c">
                    <div class="feature-item flex row wrap a-c j-c">
                        <div class="feature-info">
                            <h3 class="big-title">
                                Use stickers to express your mood
                            </h3>
                            <p>
                                We have a wide range of stickers to help you.
                                You can also use your own stickers. Just knock
                                us.
                            </p>
                        </div>
                        <div class="images">
                            <img
                                src="/stickers/crab/animated/12.webp"
                                alt="Sticker"
                            />
                            <img
                                src="/stickers/catteftel/animated/10.webp"
                                alt="Sticker"
                            />
                            <img
                                src="/stickers/finn/animated/12.webp"
                                alt="Sticker"
                            />
                            <img
                                src="/stickers/bear/animated/5.webp"
                                alt="Sticker"
                            />
                        </div>
                    </div>
                    <div class="feature-item flex row-rev wrap a-c j-c">
                        <div class="feature-info">
                            <h3 class="big-title">
                                Interactive and user-friendly interface
                            </h3>
                            <p>
                                Our platform is designed to be user-friendly and
                                interactive. You can easily navigate through the
                                app and access all its features with ease.
                            </p>
                        </div>
                        <div class="messages">
                            <div class="messageGroup">
                                <div class="av">
                                    <img
                                        src="/images/avatars/Pikachu(custom).webp"
                                        alt="Pikachu"
                                    />
                                </div>
                                <div class="m">
                                    <div class="msg">
                                        Pika.. Pika.. Pikachu!
                                    </div>
                                </div>
                            </div>
                            <div class="messageGroup me">
                                <div class="av">
                                    <img
                                        src="/images/avatars/Eevee(custom).webp"
                                        alt="Eevee"
                                    />
                                </div>
                                <div class="m">
                                    <div class="msg">
                                        Eevee.. Eevee.. Eevee!
                                    </div>
                                    <div class="msg">
                                        Ee.. Evevee.. E.. Eevee!
                                    </div>
                                </div>
                            </div>
                            <div class="messageGroup">
                                <div class="av">
                                    <img
                                        src="/images/avatars/Charmander(custom).webp"
                                        alt="Charmander"
                                    />
                                </div>
                                <div class="m">
                                    <div class="msg">Char.. char!</div>
                                    <div class="msg">
                                        Charmander.. Charmander!
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="feature-item flex row wrap a-c j-c">
                        <div class="feature-info">
                            <h3 class="big-title">
                                Files and media sharing is built-in feature
                            </h3>
                            <p>
                                Drag and drop files and media to share with your
                                friends. You can also share your location.
                            </p>
                        </div>
                        <div class="files">
                            <div class="arrow">
                                <Arrow />
                            </div>
                            <div class="icons">
                                <div class="word">
                                    <Word />
                                </div>
                                <div class="pdf">
                                    <Pdf />
                                </div>
                                <div class="img">
                                    <Img />
                                </div>
                            </div>
                            <div class="audioPlayer">
                                <div class="controls flex a-c j-c">
                                    <i class="fa-solid fa-pause"></i>
                                </div>
                                <div class="progress">
                                    <div class="bar"></div>
                                </div>
                                <div class="time">00:10</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section class="bg-default support full-width flex col a-c j-c">
                <div class="wrapp flex row wrap a-c j-c">
                    <img src="/images/team-rocket.png" alt="team rocket">
                    <div class="support-options flex col a-c j-c gap">
                        <div>Donate with Bitcoin:</div>
                        <img
                            src="/images/support_pay.png"
                            alt="Bitcoin QR Code"
                            style="width: 150px; height: 150px; border-radius: 5px;"
                        />
                        <div>Or, use this address</div>
                        <button class="btc" on:click={handleCopy}
                            >0x736Cc7836fF2A6988Ae0f25678Ce7640B71E7f04</button
                        >
                    </div>
                </div>
            </section>

            <section class="footer bg-default flex col a-c j-c gap">
                <div class="credits flex row a-c j-c gap">
                    <a class="icons" href="https://fontawesome.com/">
                        <i class="fa-solid fa-font"></i> Fontawesome
                    </a>
                    <a
                        class="img"
                        href="https://www.flaticon.com/free-icons/avatar"
                    >
                        <i class="fa-solid fa-compass-drafting"></i> Flaticons
                    </a>
                </div>
                <div class="copyrights">
                    &copy; {new Date().getFullYear()} Poketab Messenger | All rights reserved
                </div>
            </section>
        </div>
    </div>
{/if}

<style lang="scss">
    :root {
        --highlight: #00bcd4;
        --line-col: #badcfc21;
        --trace-col: #03a9f4;
    }

    .files {
        transform: translateY(-52px);
        .arrow {
            position: absolute;
            filter: drop-shadow(2px 4px 9px deepskyblue);
        }
        .icons {
            position: relative;
            width: 200px;
            height: 200px;
            transform: translateY(85px);
            .img,
            .word,
            .pdf {
                position: absolute;
                width: 80px;
                object-fit: cover;
            }
            .img {
                top: 44px;
                right: 4px;
                transform: rotate(22deg);
                z-index: 0;
            }
            .word {
                top: 50px;
                left: 54px;
                z-index: 2;
            }
            .pdf {
                top: 44px;
                left: 0px;
                transform: rotate(334deg);
                z-index: 1;
            }
        }
    }

    .audioPlayer {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: 5px;
        background: var(--trace-col);
        border-radius: 25px;
        height: 34px;
        width: 200px;
        position: relative;
        overflow: hidden;
        .progress {
            width: 30%;
            height: 100%;
            background: rgba(0, 0, 255, 0.158);
            left: 0;
            position: absolute;
            z-index: 0;
        }
        .controls {
            height: 30px;
            width: 30px;
            border-radius: 25px;
            z-index: 1;
        }
        i {
            font-size: 0.8rem;
        }
        .time {
            font-size: 0.7rem;
            color: var(--trace-col);
            background: white;
            border-radius: 25px;
            padding: 2px 5px;
            height: max-content;
            width: 40px;
            margin-right: 8px;
        }
    }

    .gap {
        gap: 10px;
    }
    .tag {
        font-size: 0.6rem;
        background: var(--glass-color);
        border-radius: 25px;
        padding: 4px 8px;
        gap: 3px;
        width: max-content;
        &::before {
            content: "";
            width: 5px;
            height: 5px;
            display: block;
            background: var(--highlight);
            border-radius: 25px;
        }
    }

    .full-width{
        width: 100%;
    }

    .messages {
        display: flex;
        flex-direction: column;
        gap: 20px;
        padding: 30px 10px;
        width: 300px;
        max-width: 100%;
        transform: perspective(385px) rotateX(17deg) rotateY(19deg)
            rotateZ(-18deg) translateY(-27px) translateX(24px);
        filter: drop-shadow(10px 7px 31px teal);
        .messageGroup {
            display: flex;
            flex-direction: row;
            align-items: flex-end;
            gap: 2px;
            width: 100%;
            .av {
                width: 35px;
                height: 35px;
                border-radius: 50%;
                img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
            }
            .m {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                gap: 2px;
            }
            .msg {
                background: rgb(20, 51, 85);
                padding: 8px 10px;
                border-radius: 5px;
                border-top-right-radius: 25px;
                border-bottom-right-radius: 25px;
                font-size: 0.8rem;
                width: max-content;
                //first-child will have border-radius 25px on top-left
                &:first-child {
                    border-top-left-radius: 25px;
                }
                //last-child will have border-radius 25px on bottom-left
                &:last-child {
                    border-bottom-left-radius: 25px;
                }
            }
            &.me {
                flex-direction: row-reverse;
                .m {
                    align-items: flex-end;
                }
                .msg {
                    background: rgb(58, 112, 237);
                    border-top-right-radius: 5px;
                    border-bottom-right-radius: 5px;
                    border-top-left-radius: 25px;
                    border-bottom-left-radius: 25px;
                    &:first-child {
                        border-top-right-radius: 25px;
                    }
                    &:last-child {
                        border-bottom-right-radius: 25px;
                    }
                }
            }
        }
    }

    .learn {
        margin-top: 20px;
        font-size: 0.8rem;
        width: max-content;
        a {
            color: var(--highlight);
            text-decoration: underline;
            &:hover {
                opacity: 0.9;
            }
        }
    }

    .support {
        padding: 45px 10px;
        font-size: 0.9rem;
        .wrapp {
            img {
                width: min(100%, 300px);
                max-width: 100%;
            }
        }
    }

    .short-width {
        max-width: 500px;
    }

    .btc {
        background: var(--glass-color);
        color: white;
        padding: 2px 5px;
        border-radius: 5px;
        cursor: pointer;
        word-break: break-all;
        text-align: justify;
        font-family: monospace;
        &:hover {
            filter: brightness(0.9);
        }
    }

    .footer {
        width: 100%;
        font-size: 0.7rem;
        padding: 20px;
    }

    .bg-default {
        background: #0f1a25;
    }

    .credits {
        a {
            text-decoration: underline;
            &:hover {
                opacity: 0.9;
            }
        }
        i {
            color: inherit;
        }
    }

    .features-container {
        background: #091016;
    }

    .feature-item {
        display: flex;
        flex-direction: row;
        gap: 20px;
        padding: 20px 0;
    }

    .feature-info {
        max-width: 400px;
        padding: 30px;
    }

    .images {
        position: relative;
        width: 200px;
        height: 200px;
        transform: translateX(60px);
        margin-bottom: 38px;
        &::before{
            content: '';
            position: absolute;
            width: 54%;
            height: 78%;
            top: 8px;
            left: 57px;
            background: deepskyblue;
            border-radius: 25%;
            filter: blur(43px);
        }
    }

    .images img {
        position: absolute;
        width: 100px;
        height: auto;
        object-fit: cover;
    }

    .images img:nth-child(1) {
        top: 95px;
        left: 84px;
        z-index: 2;
    }

    .images img:nth-child(2) {
        top: -30px;
        left: -58px;
        z-index: 1;
        width: 200px;
    }

    .images img:nth-child(3) {
        top: 47px;
        left: 94px;
        z-index: 0;
    }

    .images img:nth-child(4) {
        top: 36px;
        left: -91px;
        z-index: 2;
        width: 161px;
    }

    .consent {
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.5);
        margin-top: 30px;
        a {
            //reset all styles
            all: initial;
            color: var(--highlight);
            font-family: inherit;
            font-size: inherit;
            cursor: pointer;
            text-decoration: underline;
            &:hover {
                opacity: 0.9;
            }
        }
    }

    .landing-img {
        width: 480px;
        max-width: 100%;
    }

    .container {
        backdrop-filter: blur(5px);
    }

    .about {
        .txt {
            margin: 20px 0 20px 0;
            font-size: 0.9rem;
            color: rgba(255, 255, 255, 0.5);
        }
    }

    .links {
        display: flex;
        flex-direction: row;
        margin-top: 20px;
        gap: 20px;
        justify-content: center;
    }

    #login {
        color: rgb(255, 255, 255);
        background: var(--highlight);
    }

    #github {
        color: rgb(255, 255, 255);
        background: rgb(0, 0, 0);
    }

    .button-animate {
        transition: 0.1s ease-in-out;
    }

    .button {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        font-size: 0.9rem;
        cursor: pointer !important;
        gap: 5px;
        border-radius: 10px;
        padding: 8px 10px;
        text-decoration: none !important;
    }

    .button:hover {
        filter: brightness(0.9);
    }
    .platforms {
        font-size: 3rem;
        padding-top: 40px;
        gap: 20px;
        width: 100%;
        i {
            font-size: inherit;
            margin: 0 10px;
        }
    }

    .top-feature {
        padding: 20px;
        color: white;
        .main {
            max-width: 400px;
            margin-right: auto;
        }

        .card {
            background: #0f1a25;
            width: 100%;
            border-radius: 20px;
            padding: 22px 44px 44px;
            overflow: hidden;
            position: relative;
            gap: 20px;
            max-width: 1000px;

            .content {
                .img {
                    width: 100%;
                    max-width: min(100%, 450px);
                }
            }
        }
    }

    .des {
        color: rgba(255, 255, 255, 0.8);
        font-size: 0.9rem;
    }

    .big-title {
        font-size: 1.8rem;
        color: white;
        padding-bottom: 10px;
    }

    .wrapper {
        overflow: scroll;
        width: 100%;
        height: 100%;
    }

    .ball-open::before {
        content: "";
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: url("/images/ball-open.jpg");
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
        background-blend-mode: color-dodge;
        background-attachment: fixed;
        background-color: #080d13;
        z-index: -1;
    }

    .hero-container {
        padding: 20px;
        padding-top: 80px;
        padding-bottom: 60px;
        .hero {
            align-items: flex-start;
        }
    }

    .version {
        margin: 10px;
        font-size: 0.6rem;
        border-radius: 5px;
        .f {
            background: rgba(91, 251, 91, 0.157);
            color: rgb(170, 255, 170);
            padding: 4px 5px;
            border-top-right-radius: inherit;
            border-bottom-right-radius: inherit;
        }
        .v {
            background: black;
            padding: 4px 5px;
            border-top-left-radius: inherit;
            border-bottom-left-radius: inherit;
        }
    }

    .flex {
        display: flex;
    }

    .a-c {
        align-items: center;
    }

    .j-c {
        justify-content: center;
    }

    .j-sa {
        justify-content: space-around;
    }

    .col {
        flex-direction: column;
    }

    .row {
        flex-direction: row;
    }

    .row-rev {
        flex-direction: row-reverse;
    }

    .wrap {
        flex-wrap: wrap;
    }

    .titleText {
        font-size: 2.6rem;
        text-align: left;
        font-weight: 900;
        color: rgb(255, 255, 255);
    }
</style>
