<script lang="ts">
  import { getTalentInfo, type TalentId } from "./talents";

  export let talentId: TalentId;
  export let learned: boolean;
  export let pointsAvailable: number;
  export let dependentsSatisfied: boolean;
  export let onLearn: () => void;

  $: talentInfo = getTalentInfo(talentId);

  const getFragments = (line: string): string[] => line.split("*");
</script>

<div data-testid="talent-viewer" class="wrapper">
  <p>
    {talentInfo.name}
  </p>
  {#each talentInfo.description as line}
    <p>
      {#each getFragments(line) as fragment, index}
        <span class:strong={index % 2 === 1}>{fragment}</span>
      {/each}
    </p>
  {/each}
  {#if !learned}
    <button
      on:click={onLearn}
      disabled={pointsAvailable <= 0 || !dependentsSatisfied}>Learn</button
    >
  {/if}
</div>

<style>
  .wrapper {
    display: flex;
    flex-direction: column;
    row-gap: 8px;
    height: 100%;
  }

  p:first-of-type,
  .strong {
    font-weight: 700;
  }

  p:nth-of-type(n + 2) {
    font-size: 1rem;
  }

  button {
    margin-top: auto;
  }
</style>
