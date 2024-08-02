<div
  class="container"
>
<div class="dot"></div>
<div class="traveler"></div>
</div>
<svg width="0" height="0" class="svg">
  <defs>
    <filter id="uib-jelly-triangle-ooze">
      <feGaussianBlur
        in="SourceGraphic"
        stdDeviation="3.333"
        result="blur"
      />
      <feColorMatrix
        in="blur"
        mode="matrix"
        values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
        result="ooze"
      />
      <feBlend in="SourceGraphic" in2="ooze" />
    </filter>
  </defs>
</svg>

<style>
  .container {
    --uib-size: 16px;
    --uib-color: rgb(255, 255, 255);
    --uib-speed: 0.75s;
    position: relative;
    height: var(--uib-size);
    width: var(--uib-size);
    filter: url('#uib-jelly-triangle-ooze');
  }

  .container::before,
  .container::after,
  .dot {
    content: '';
    position: absolute;
    width: 33%;
    height: 33%;
    background-color: var(--uib-color);
    border-radius: 100%;
    will-change: transform;
    transition: background-color 0.3s ease;
  }

  .dot {
    top: 6%;
    left: 30%;
    animation: grow var(--uib-speed) ease infinite;
  }

  .container::before {
    bottom: 6%;
    right: 0;
    animation: grow var(--uib-speed) ease calc(var(--uib-speed) * -0.666) infinite;
  }

  .container::after {
    bottom: 6%;
    left: 0;
    animation: grow var(--uib-speed) ease calc(var(--uib-speed) * -0.333) infinite;
  }

  .traveler {
    position: absolute;
    top: 6%;
    left: 30%;
    width: 33%;
    height: 33%;
    background-color: var(--uib-color);
    border-radius: 100%;
    animation: triangulate var(--uib-speed) ease infinite;
    transition: background-color 0.3s ease;
  }

  .svg {
    width: 0;
    height: 0;
    position: absolute;
  }

  @keyframes triangulate {
    0%,
    100% {
      transform: none;
    }

    33.333% {
      transform: translate(120%, 175%);
    }

    66.666% {
      transform: translate(-95%, 175%);
    }
  }

  @keyframes grow {
    0%,
    85%,
    100% {
      transform: scale(1.5);
    }

    50%,
    60% {
      transform: scale(0);
    }
  }
</style>

