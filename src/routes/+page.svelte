<script lang="ts">
    import { fade, fly } from "svelte/transition";
    import ReactiveLogo from "./reactiveLogo.svelte";
    import { onMount } from "svelte";
    import { currentTheme } from "$lib/store";

    export let data;
    const version = data.version;

    currentTheme.set(data.theme);

    let mounted = false;

    onMount(() => {
        mounted = true;
    });

    const featureItemsData = [
        {
            iconClass: "fas fa-user-friends",
            title: "Group chat.",
            description:
                "Poketab Messenger allows you to chat with up to 10 people at once. No one can interrupt your conversations. So, you can chat with your friends and colleagues without any distractions. Just keep the conversation going.",
        },
        {
            iconClass: "fas fa-lock",
            title: "Encrypted message.",
            description:
                "We understand the importance of privacy, which is why we do not store any of your messages or files on our servers. Our app simply relays the information, ensuring that your conversations remain private and secure.",
        },
        {
            iconClass: "fas fa-mobile-alt",
            title: "Works on all devices.",
            description:
                "Poketab Messenger is a Progressive Web App (PWA), which means it works on all devices, including mobile. You can use it on your desktop, laptop, tablet, or mobile phone. No need to install any app, just use it on any device. It's that simple.",
        },
        {
            iconClass: "fas fa-bolt",
            title: "Fast and lightweight.",
            description:
                "This is not native app that can steal your information. It's fully web-based and it fetches its content from the server only when you need it.",
        },
        {
            iconClass: "fa-solid fa-share-nodes",
            title: "Easy file sharing.",
            description:
                "With Poketab Messenger, you can easily share files, images, and even record audio messages to bring your conversations to life.",
        },
        {
            iconClass: "fas fa-comment",
            title: "Chat replies and reactions.",
            description:
                "Poketab Messenger allows you to reply to any message in a chat. You can also react to any message with a variety of fun and expressive stickers and reactions.",
        },
    ];
</script>

<svelte:head>
    <title>Poketab - Get Started</title>
    <meta name="theme-color" content="#111d2a" />
    <meta name="title" content="PokeTab Messenger"/>
    <meta name="description" content="This is a temporary instant messaging app where you can chat also in groups. There is no database so any of your chat is not stored. ">
    <meta property="og:title" content="Instant Messaging App" />
    <meta property="og:description" content="This is a temporary instant messaging app where you can chat also in groups. There is no database so any of your chat is not stored. ">
    <meta property="og:image" content="cover.png"/>
    
    <link rel="apple-touch-icon" href="icons/apple-icon-180.png">
    
    <meta name="apple-mobile-web-app-capable" content="yes">
    
    <link rel="apple-touch-startup-image" href="icons/apple-splash-2048-2732.jpg" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">
    <link rel="apple-touch-startup-image" href="icons/apple-splash-2732-2048.jpg" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)">
    <link rel="apple-touch-startup-image" href="icons/apple-splash-1668-2388.jpg" media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">
    <link rel="apple-touch-startup-image" href="icons/apple-splash-2388-1668.jpg" media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)">
    <link rel="apple-touch-startup-image" href="icons/apple-splash-1536-2048.jpg" media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">
    <link rel="apple-touch-startup-image" href="icons/apple-splash-2048-1536.jpg" media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)">
    <link rel="apple-touch-startup-image" href="icons/apple-splash-1668-2224.jpg" media="(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">
    <link rel="apple-touch-startup-image" href="icons/apple-splash-2224-1668.jpg" media="(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)">
    <link rel="apple-touch-startup-image" href="icons/apple-splash-1620-2160.jpg" media="(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">
    <link rel="apple-touch-startup-image" href="icons/apple-splash-2160-1620.jpg" media="(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)">
    <link rel="apple-touch-startup-image" href="icons/apple-splash-1284-2778.jpg" media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)">
    <link rel="apple-touch-startup-image" href="icons/apple-splash-2778-1284.jpg" media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)">
    <link rel="apple-touch-startup-image" href="icons/apple-splash-1170-2532.jpg" media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)">
    <link rel="apple-touch-startup-image" href="icons/apple-splash-2532-1170.jpg" media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)">
    <link rel="apple-touch-startup-image" href="icons/apple-splash-1125-2436.jpg" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)">
    <link rel="apple-touch-startup-image" href="icons/apple-splash-2436-1125.jpg" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)">
    <link rel="apple-touch-startup-image" href="icons/apple-splash-1242-2688.jpg" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)">
    <link rel="apple-touch-startup-image" href="icons/apple-splash-2688-1242.jpg" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)">
    <link rel="apple-touch-startup-image" href="icons/apple-splash-828-1792.jpg" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">
    <link rel="apple-touch-startup-image" href="icons/apple-splash-1792-828.jpg" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)">
    <link rel="apple-touch-startup-image" href="icons/apple-splash-1242-2208.jpg" media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)">
    <link rel="apple-touch-startup-image" href="icons/apple-splash-2208-1242.jpg" media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)">
    <link rel="apple-touch-startup-image" href="icons/apple-splash-750-1334.jpg" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">
    <link rel="apple-touch-startup-image" href="icons/apple-splash-1334-750.jpg" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)">
    <link rel="apple-touch-startup-image" href="icons/apple-splash-640-1136.jpg" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">
    <link rel="apple-touch-startup-image" href="icons/apple-splash-1136-640.jpg" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)">
    
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
    <link rel="preload" href="/fonts/comic-webfont.woff2" as="font" type="font/woff2" crossorigin="anonymous">
    <link rel="stylesheet" href="/styles/themes/{$currentTheme}.css">
    <link rel="stylesheet" href="/libs/fontawesome/css/all.min.css" crossorigin="anonymous">
    
</svelte:head>

{#if mounted}
<div class="maincontainer">
    <ReactiveLogo />
    <h1 class="title" transition:fly={{x: 20}}>
        Poketab Messenger <span class="version">v.{version}</span>
    </h1>
    <div class="slogan" transition:fly={{x:-10, delay: 300}}>A Secure and User-Friendly Chatting WebApp</div>

    <div class="more" transition:fly={{x: 10, delay: 350}}>
        Poketab Messenger is a chat app that offers a temporary and secure way
        to connect with friends and family. It requires no login or account
        creation and has a range of features, including rich text typing, code
        highlighting, location sharing, file transfers, and personalized themes
        and stickers. The app is serverless, ensuring that no data is stored on
        its servers. Simply start a chat and share the link with friends for a
        hassle-free communication experience with guaranteed privacy and
        security.
    </div>

    <div class="links">
        <a id="login" class="button-animate btn play-sound" href="/chat"
            transition:fly={{y: 10, delay: 600}}
            >Start Chat
        </a>
        <a
            id="github"
            class="button-animate btn play-sound"
            href="https://github.com/itsfuad/poketab-messenger"
            transition:fly={{y: 10, delay: 700}}
            >View Source
        </a>
    </div>

    <div class="titleText" in:fly={{x: 10, delay: 800}}>What does it offer?</div>
    <div class="feature" in:fade|global={{delay: 1000}}>
        {#each featureItemsData as feature}
            <div class="feature-item" >
                <i class={feature.iconClass} />
                <div class="feature-item-title">
                    {feature.title}
                </div>
                <div class="detail">
                    {feature.description}
                </div>
            </div>
        {/each}
    </div>

    <div class="footer">
        <a href="mailto:support@poketab.live">support@poketab.live</a>
    </div>
</div>
{/if}

<style lang="scss">
    .version {
        font-size: 0.7rem;
        color: var(--secondary-dark, #419eff);
    }
    .maincontainer {
        color: white;
        padding: 10% 20px 0px 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        text-align: justify;
        gap: 20px;
        height: 100%;
        overflow: scroll;
    }
    .more {
        color: #ffffff95;
        width: clamp(300px, 60vw, 1000px);
    }
    a {
        text-decoration: none;
        padding: 10px;
        border-radius: 10px;
        transition: 300ms;
    }
    a:hover {
        cursor: pointer;
        transform: translateY(-3px);
        box-shadow: 0 3px 5px black;
    }
    #login {
        background: var(--secondary-dark, #4598ff);
        color: white;
    }
    #github {
        background: black;
        color: white;
    }
    .title {
        color: #ffd400;
        text-align: center;
    }
    .links {
        display: flex;
        flex-direction: row;
        gap: 20px;
    }
    .titleText {
        font-size: 1.6rem;
        padding-top: 85px;
        text-align: center;
    }

    .feature {
        font-size: 0.8rem;
        display: flex;
        flex-direction: row;
        max-width: 100%;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 30px;
    }

    .feature-item {
        display: flex;
        flex-direction: column;
        gap: 30px;
        align-items: flex-start;
        justify-content: center;
        background: #22283b;
        backdrop-filter: blur(2px);
        padding: 35px;
        border-radius: 10px;
        position: relative;
        max-width: 400px;
        transition: 200ms ease-in-out;
        cursor: pointer;
    }

    .feature-item i {
        font-size: 4rem;
    }

    .feature-item:hover {
        transform: translateY(-5px);
    }

    .feature-item-title {
        font-size: 1.3rem;
        text-align: center;
    }

    .fa-user-friends {
        color: #ffc978;
    }

    .fa-lock {
        color: indianred;
    }

    .fa-mobile-alt {
        color: #999999;
    }

    .fa-bolt {
        color: #ffd400;
    }

    .fa-share-nodes {
        color: #419eff;
    }

    .fa-comment {
        color: #33ff8e;
    }

    .detail {
        color: #cfcfcf9a;
    }
    .footer {
        font-size: 0.7rem;
        padding: 40px 10px 10px 10px;
    }
    a {
        color: white;
        cursor: pointer;
    }
    a:hover {
        text-decoration: underline;
    }
</style>
