<script>
    import { page } from "$app/stores";
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
</div>

<a href="/" class="btn button-animate play-sound">
    Home
</a>

<style>

    .text {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    h1 {
        font-size: 6rem;
        color: #3e5968;
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
