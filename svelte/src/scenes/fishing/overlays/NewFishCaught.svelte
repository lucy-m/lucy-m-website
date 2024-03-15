<script lang="ts">
  import { interval, map, startWith, tap } from "rxjs";
  import { getFishData } from "../fish-data";
  import OverlayBase from "./OverlayBase.svelte";

  export let unmountSelf: () => void;
  export let fishType: string;

  const fishData = getFishData(fishType);

  const timeRemaining = interval(1000).pipe(
    map((i) => 9 - i),
    startWith(10),
    tap((i) => {
      if (i === 0) {
        unmountSelf();
      }
    })
  );
</script>

<OverlayBase width="wide">
  <div class="content" data-testid="new-fish-caught-overlay">
    <p class="header">You caught a new fish!</p>
    <div class="fish-display">
      <div class="fish-data">
        <dl>
          <dt>Name</dt>
          <dd>{fishData.displayName}</dd>
          <dt>Weight</dt>
          <dd>{fishData.weight.toFixed(1)} kg</dd>
        </dl>
        <blockquote>
          {fishData.flavour}
        </blockquote>
      </div>
      <div class="loading-container">
        <img src={fishData.backgroundSrc} alt="" />
      </div>
    </div>
    <button on:click={unmountSelf}>Cool! ({$timeRemaining})</button>
  </div>
</OverlayBase>

<style>
  .content {
    display: flex;
    flex-direction: column;
    row-gap: 24px;
  }

  .header {
    text-align: center;
    font-size: 1.5rem;
    font-family: "Bitter";
    letter-spacing: -1px;
    background-color: var(--overlay-background-dark);
    margin: calc(var(--overlay-padding) * -1);
    padding: var(--overlay-padding);
    padding-bottom: 4px;
    margin-bottom: 0;
  }

  .fish-display {
    display: grid;
    grid-template-columns: 3fr 2fr;
    column-gap: 16px;
  }

  .loading-container {
    position: relative;
    width: 100%;
    padding-top: 100%;
    height: 0;
    background: hsl(210, 12%, 96%);
    background-image: linear-gradient(
      to right,
      hsl(210, 12%, 96%) 0%,
      hsl(225, 12%, 94%) 20%,
      hsl(210, 12%, 96%) 40%,
      hsl(210, 12%, 96%) 100%
    );
    background-size: 800px 100px;
    animation-name: shimmer;
    animation-duration: 1s;
    animation-delay: 1s;
    animation-iteration-count: infinite;
  }

  @keyframes shimmer {
    0% {
      background-position: -300px 0;
    }

    100% {
      background-position: 300px 0;
    }
  }

  img {
    width: 100%;
    position: absolute;
    top: 0;
  }

  .fish-data {
    display: flex;
    flex-direction: column;
    row-gap: 8px;
    justify-content: space-between;
  }

  dl {
    margin: 0;
  }

  dt {
    font-size: 0.7rem;
  }

  dd {
    margin-left: 16px;
  }

  dd + dt {
    margin-top: 8px;
  }

  blockquote {
    margin: 0;
    font-style: italic;
    font-family: "Bitter";
    font-size: 0.8rem;
  }
</style>
