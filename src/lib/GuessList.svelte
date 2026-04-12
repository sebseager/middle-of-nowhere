<script lang="ts">
  import type { GuessResult } from './gameStore';

  interface Props {
    guesses: GuessResult[];
  }

  let { guesses }: Props = $props();
  const slots = [0, 1, 2, 3, 4, 5];

  const getDistanceClass = (guess: GuessResult): string => {
    if (guess.correct) {
      return 'slot-correct';
    }

    return guess.milesAway < 1000 ? 'slot-near' : 'slot-far';
  };
</script>

<div class="guess-slots" aria-label="Guess history">
  {#each slots as slot}
    {@const guess = guesses[slot]}
    {#if !guess}
      <div class="slot slot-empty">&nbsp;</div>
    {:else}
      <div class="slot-group">
        <div class={`slot ${getDistanceClass(guess)}`}>
          <span>{guess.input}</span>
        </div>
        <div class="distance-box">{guess.input} is {guess.milesAway} miles away</div>
      </div>
    {/if}
  {/each}
</div>
