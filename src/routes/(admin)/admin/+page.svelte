<script lang="ts">

    import { onMount } from "svelte";
    import { fly } from "svelte/transition";
    import ReactiveLogo from "$lib/components/reactiveLogo.svelte";

	export let data;

    let loaded = false;
    let submitting = false;
    let errlog = false;
    let logText = "";
    let passKeyLabel = "Admin passkey";
    let messageLabel = "Message";
	let timeLabel = "Restart after (Sec)";
    let passKey: HTMLInputElement;
    let message: HTMLInputElement;
    let time: HTMLInputElement;

    function handleForm() {
        
        if (!passKey.value){
            passKeyLabel = "<span style='color: red;'>Admin passkey is required</span>";
            submitting = false;
            errlog = true;
            passKey.focus();
            return;
        }

        if (!message.value){
            messageLabel = "<span style='color: red;'>Message is required</span>";
            submitting = false;
            errlog = true;
            message.focus();
            return;
        }

        if (!time.value){
            timeLabel = "<span style='color: red;'>Time is required</span>";
            submitting = false;
            errlog = true;
            time.focus();
            return;
        }

		submitting = true;
		errlog = false;
		logText = "Sending message...";

		try{
			//app.post('/mbm/:adminPasskey/:message/:time'
			fetch(`${data.serverURL}/mbm/${passKey.value}/${message.value}/${time.value}`)
			.then( async (res) => {
				if (res.ok){
					errlog = false;
					logText = "Message sent successfully.";
					submitting = false;
				} else {
					const message = await res.json();
					logText = message.message;
					errlog = true;
					submitting = false;
				}
			}).catch( (e) => {
				logText = "Failed to send message.";
				errlog = true;
				submitting = false;
			});
		} catch (e){
			logText = "Failed to send message.";
			errlog = true;
			submitting = false;
		}
        
    }

    onMount(() => {
        loaded = true;
    });

</script>



{#if loaded}
<div class="formWrapper">
	<form on:submit|preventDefault={handleForm} class="form" in:fly={{y: 20, delay: 200}}>
		<div class="title" in:fly|global={{x: -10, delay: 200}}>
            <ReactiveLogo size={70}/>
            Admin message panel
		</div>
		{#if !submitting}
		<div class="formfield" in:fly|global={{y: 10, delay: 250}}>
			<input on:input={()=> {passKeyLabel = 'Admin passkey'}}  placeholder="Passkey" type="password" bind:this={passKey} id="userid" name="passKey" />
			<label for="passKey">{@html passKeyLabel}</label>
		</div>
		<div class="formfield" in:fly|global={{y: 10, delay: 300}}>
			<input on:input={() => {messageLabel = 'Message'}} placeholder="Message..." type="text" bind:this={message} id="message" name="message" />
			<label for="message">{@html messageLabel}</label>
		</div>
        <div class="formfield" in:fly|global={{y: 10, delay: 300}}>
			<input on:input={() => {timeLabel = 'Restart after (Sec)'}} placeholder="10" type="number" bind:this={time} id="time" name="time" />
			<label for="time">{@html timeLabel}</label>
		</div>
		<button type="submit" in:fly|global={{y: 10, delay: 350}}>Post <i class="fa-solid fa-message"></i></button>
		{/if}
		{#if logText}
		<div class="log" class:submitting={submitting} class:error={errlog}>
			{logText}
			{#if errlog}
			<i class="fa-solid fa-triangle-exclamation"></i>
			{/if}
		</div>
		{/if}
	</form>
</div>
{/if}


<style lang="scss">

	:global(body){
		background: var(--primary-dark);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
		width: 100vw;
		overflow: hidden;
	}

	.log{
		font-size: 0.8rem;
		color: var(--secondary-dark);
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		gap: 3px;

		&.error{
			color: orangered;
		}

	}

	.fa-triangle-exclamation {
		color: orange !important;
	}

	.formWrapper{
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		max-width: 90vw;
		width: 350px;
		height: 500px;
		position: relative;
	}

	.form{
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 15px;
		border: 2px solid var(--option-color);
		border-radius: 10px;
		padding: 40px 20px;
		width: 100%;
		height: 100%;
		transition: 150ms ease-in-out;

		&:has(.submitting){
			height: 225px;
		}

		.title{
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			gap: 10px;
			font-size: 1rem;
		}
	}

	.formfield{
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: center;
		width: 100%;

		label{
			position: absolute;
			transition: 200ms ease-in-out;
			pointer-events: none;
			width: 100%;
			font-size: 0.8rem;
			color: var(--label-color);
		}

		input:focus + label{
			transform: translateY(-20px);
			font-size: 0.6rem;
			color: var(--secondary-dark);
		}

		input::placeholder{
			opacity: 0;
		}

		input:not(:placeholder-shown) + label{
			transform: translateY(-20px);
			font-size: 0.6rem;
			opacity: 1;
			color: var(--secondary-dark);
		}
	}

	input{
		background: none;
		border: none;
		border-bottom: 2px solid var(--option-color);
		padding: 10px;
		outline: none;
		width: 100%;
		color: ghostwhite;
		transition: 200ms ease-in-out;
		&:hover{
			border-bottom: 2px solid var(--faded-accent);
		}
		&:focus{
			border-bottom: 2px solid var(--secondary-dark);
		}
	}

	button{
		background: var(--option-color);
		border: none;
		border-radius: 10px;
		padding: 10px 15px;
		color: ghostwhite;
		cursor: pointer;
		margin-top: 20px;
		&:hover{
			opacity: 0.9;
		}
	}

</style>