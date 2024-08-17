<script>
    import { page } from "$app/stores";
    import "$lib/styles/global.scss";
</script>

<svelte:head>
    <link rel="icon" href="/images/error.png" />
    <title>
        Oopps!!
    </title>
</svelte:head>

<div class="container">
    <div class="text">
        <h1>
            {$page.status}
        </h1>
        <h3>
            {$page.error?.message}
        </h3>
    </div>
    <a href="/" class="button-animate play-sound">
        Home
    </a>
</div>

<style>
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        width: 100%;
        inset: 0;
        background: var(--modal-color, #0b0c10);
    }

    .text {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    h1 {
        font-size: 6rem;
        color: #ffffff42;
    }

    h3 {
        color: #fff;
        position: absolute;
    }

    a {
        color: #fff;
        text-decoration: none;
        background: var(--secondary-dark, #0575e6);
        padding: 10px 20px;
        border-radius: 10px;
    }

    a:hover {
        filter: brightness(0.9);
    }
</style>
