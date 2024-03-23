<script lang="ts">
    import { fade, fly } from "svelte/transition";
    import ReactiveLogo from "$lib/components/reactiveLogo.svelte";
    import { onMount } from "svelte";

    const version = __VERSION__;

    let mounted = false;
    
    onMount(() => {
        console.log("Mounted Root +page.svelte");
        //showToastMessage("Welcome to Poketab Messenger", 20000);
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
            iconClass: "fa-solid fa-reply",
            title: "Chat replies and reactions.",
            description:
                "Poketab Messenger allows you to reply to any message in a chat. You can also react to any message with a variety of fun and expressive stickers and reactions.",
        },
    ];
</script>

{#if mounted}

<div class="container">
    <div class="top-hero" in:fly|global={{ y: -10, delay: 100 }}>
        <div class="flex column center">
            <div class="logo">
                <ReactiveLogo />
            </div>
            <div class="name">
                Poketab Messenger
            </div>
        </div>
        <div class="version-info">
            <div class="version">v.{version}</div>
            Free and Open Source
        </div>
    </div>
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
        <a id="login" class="button-animate button play-sound" href="/chat"
            transition:fly={{y: 10, delay: 600}}
            >Start Chat
        </a>
        <a
            id="github"
            class="button-animate button play-sound"
            href="https://github.com/itsfuad/poketab-messenger"
            transition:fly={{y: 10, delay: 700}}
            >View Source <i class="fa-solid fa-arrow-up-right-from-square"></i>
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
        <a href="https://fontawesome.com">Icons partner fontawesome <i class="fa-solid fa-font"></i> </a>
        <a href="https://www.flaticon.com/free-icons/pokemon">Assets partner flaticon<i class="fa-solid fa-compass-drafting"></i></a>
        &copy; {new Date().getFullYear()} - BrainBird.org
    </div>
</div>
{/if}

<style lang="scss">

.top-hero{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 20px;
    gap: 5px;

    .logo{
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 5px;
    }

    .name{
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 5px;
        font-size: 2rem;
        font-weight: 900;
        color: #ffd400;
    }

}

.slogan{
    font-size: 1.1rem;
    text-align: center;
}

.version-info{
        font-size: 0.6rem;
        color: #ffffff;
        padding: 0 5px 0 0;
        border-radius: 5px;
        width: max-content;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        font-weight: normal;
        gap: 5px;
        background: rgba(91, 251, 91, 0.156);
        color: rgb(170, 255, 170);
        .version {
            background: rgba(0, 0, 0, 0.997);
            height: 100%;
            padding: 5px 5px;
            color: ghostwhite;
            font-family: inherit;
            border-top-left-radius: inherit;
            border-bottom-left-radius: inherit;
        }
    }

    .container{
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        gap: 20px;
        padding: 20px;
        height: 100%;
        width: 100%;
        inset: 0;
        overflow: scroll;
    }

    .more {
        font-size: 0.9rem;
        color: #ffffff95;
        width: min(100%, 900px);
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
        background: #22283bba;
        box-shadow: 0 3px 5px var(--shadow);
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
    .footer{
        font-size: 0.7rem;
        display: flex;
        flex-direction: column;
        width: 100%;
        justify-content: center;
        align-items: center;
        gap: 10px;
        
        i {
            color: inherit;
        }
    }
</style>
