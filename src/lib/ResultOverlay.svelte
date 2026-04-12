<script lang="ts">
  import type { City } from './cities';

  interface Props {
    status: 'playing' | 'won' | 'lost';
    target: City;
    startNewRound: () => void;
  }

  let { status, target, startNewRound }: Props = $props();
</script>

{#if status !== 'playing'}
  <div class="result-overlay {status === 'won' ? 'result-win' : 'result-loss'}">
    {#if status === 'won'}
      <p>Correct! It was <strong>{target.city}, {target.state}</strong>.</p>
    {:else}
      <p>The city was <strong>{target.city}, {target.state}</strong>.</p>
    {/if}
    <button class="new-round-btn" on:click={startNewRound}>New Round</button>
  </div>
{/if}
