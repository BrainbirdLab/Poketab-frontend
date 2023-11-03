<script>
/**
 * Represents a message with text, code, and button text.
 * @typedef {Object} Message
 * @property {string} text - The text content of the message.
 * @property {number} code - The code associated with the message.
 * @property {string} buttonText - The text displayed on the button related to the message.
 */

/**
 * The message to display.
 * @type {Message}
 */
 export let message;

</script>

<div class="container">
    <div class="text">
        <h1>
            {message.code}
        </h1>
        <h3>
            {message.text}
        </h3>
    </div>
</div>

<a href="/" class="btn button-animate play-sound">
    {message.buttonText}
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
            color: #3E5968;
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