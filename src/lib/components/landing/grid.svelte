<script lang="ts">
    import { onMount } from 'svelte';
  
    // Props
    export let color: string = 'rgba(0, 200, 0, 1)'; // Default color
  
    // Increased spacing and reduced the number of rows and columns
    const gridRows = 50;
    const gridCols = 50;
    const boxSize = 15;
    const spacing = 20;
  
    let canvas: HTMLCanvasElement;
  
    onMount(() => {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        animateGrid(ctx);
      }
    });
  
    function animateGrid(ctx: CanvasRenderingContext2D) {
      const boxes: any[] = [];
  
      for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridCols; col++) {
          boxes.push({
            x: col * (boxSize + spacing),
            y: row * (boxSize + spacing),
            opacity: 0, // Start fully transparent
            speed: Math.random() * 0.05 + 0.01,
            direction: 1, // Initial direction is to increase opacity
            delay: Math.random() * 5000, // Random delay before starting
          });
        }
      }
  
      function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
  
        for (const box of boxes) {
          if (box.delay <= 0) {
            box.opacity += box.speed * box.direction;
  
            if (box.opacity >= 1 || box.opacity <= 0) {
              box.direction *= -1; // Reverse direction
            }
  
            box.opacity = Math.max(0, Math.min(1, box.opacity)); // Clamp opacity between 0 and 1
          } else {
            box.delay -= 1000 / 60;
          }
  
          ctx.fillStyle = `rgba(${parseColor(color, box.opacity)})`;
          ctx.fillRect(box.x, box.y, boxSize, boxSize);
        }
  
        requestAnimationFrame(draw);
      }
  
      draw();
    }
  
    function parseColor(color: string, opacity: number): string {
      // Extract RGB values and return them with the specified opacity
      const match = color.match(/\d+/g);
      if (match) {
        return `${match[0]}, ${match[1]}, ${match[2]}, ${opacity}`;
      }
      return `0, 200, 0, ${opacity}`; // Fallback color
    }
  </script>
  
  <canvas bind:this={canvas} width={gridCols * (boxSize + spacing)} height={gridRows * (boxSize + spacing)} />
  
  <style>
    canvas {
        max-width: 100%;
    }
  </style>