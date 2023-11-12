<script lang="ts">
    let key = '';
  
    function validateKey(event: KeyboardEvent) {
      // Check if the pressed key is not an alphanumeric character or backspace
      if (!/^[a-zA-Z0-9]$/.test(event.key) || event.key === 'Backspace') {
        if (event.key !== 'Backspace') {
          key += event.key;
        } else if (event.key === 'Backspace' && key.length > 0) {
          key = key.slice(0, -1);
        }
  
        // Format the input according to the specified pattern
        let formattedOutput = '';
        for (let i = 0; i < key.length; i++) {
          if (i === 2 || i === 5) {
            formattedOutput += '-';
          }
          formattedOutput += key[i];
        }
  
        // Update the bound value
        key = formattedOutput;
      } else {
        // Prevent input of alphanumeric characters (and other than backspace)
        event.preventDefault();
      }
    }
  
    function parseKey(event: ClipboardEvent) {
      if (!event.clipboardData) {
        return;
      }
      // Prevent pasting non-numeric values
      const pastedText = event.clipboardData.getData('text/plain');
      if (!/^\d*$/.test(pastedText)) {
        event.preventDefault();
      }
    }
  </script>
  
  <input
    on:paste={parseKey}
    on:keydown={validateKey}
    id="key"
    type="text"
    bind:value={key}
    name="key"
    placeholder="xx-xxx-xx"
  />
  