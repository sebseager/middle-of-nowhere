<script lang="ts">
  import type { GuessResult } from './gameStore';

  interface Props {
    guesses: GuessResult[];
  }

  let { guesses }: Props = $props();
  const slots = [0, 1, 2, 3, 4, 5];
</script>

<div class="guess-slots" aria-label="Guess history">
  {#each slots as slot}
    {@const guess = guesses[slot]}
    {#if !guess}
      <div class="slot slot-empty">&nbsp;</div>
    {:else if guess.correct}
      <div class="slot slot-correct">
        <span>{guess.input}</span>
        <span aria-hidden="true">✓</span>
      </div>
    {:else}
      <div class="slot slot-wrong">
        <span>{guess.input}</span>
        <span aria-hidden="true">✗</span>
      </div>
    {/if}
  {/each}
</div>
