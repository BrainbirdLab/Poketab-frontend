<script lang="ts">
    import { onMount } from 'svelte';
  
    let reacts = new Map<string, string>(); // Map of userID to emoji
    let uniqueReacts: any = []; // Array to store unique reacts with counts
  
    function addReact(userId: string, emoji: string) {
      reacts.set(userId, emoji);
      updateUniqueReacts();
    }
  
    function removeReact(userId: string) {
      reacts.delete(userId);
      updateUniqueReacts();
    }
  
    function updateUniqueReacts() {
      const reactCounts = new Map<string, number>();
  
      reacts.forEach((emoji) => {
        reactCounts.set(emoji, (reactCounts.get(emoji) || 0) + 1);
      });
  
      uniqueReacts = Array.from(reactCounts.entries());
    }
  
    // Function to determine if a react is new for animation
    function isNewReact(emoji: string) {
      return reacts.size > 1 && reacts.has(emoji) && reacts.get(emoji) !== emoji;
    }
  
    onMount(() => {
      updateUniqueReacts();
    });
  </script>
  
  <style>
    .react {
      display: flex;
      align-items: center;
      margin: 5px;
    }
  
    .emoji {
      font-size: 20px;
      margin-right: 5px;
    }
  
    .animate {
      /* Add your animation styles here */
      animation: bounce 0.5s ease; /* Example animation, adjust as needed */
    }
  
    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% {
        transform: translateY(0);
      }
      40% {
        transform: translateY(-10px);
      }
      60% {
        transform: translateY(-5px);
      }
    }
  </style>
  
  {#each uniqueReacts as [emoji, count]}
    <div class="react">
      <div class:animate={isNewReact(emoji)} class="emoji">{emoji}</div>
      <div>Total Reacts: {count}</div>
    </div>
  {/each}
  
  <button on:click={() => addReact('user1', '👍')}>Add 👍</button>
  <button on:click={() => addReact('user2', '😊')}>Add 😊</button>
  <button on:click={() => removeReact('user1')}>Remove 👍</button>
  <button on:click={() => removeReact('user2')}>Remove 😊</button>
  