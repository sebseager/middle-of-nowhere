<script lang="ts">
  import CityDropdown from './CityDropdown.svelte';
  import type { SubmitResult } from './gameStore';

  interface Props {
    labels: string[];
    status: 'playing' | 'won' | 'lost';
    submitGuess: (input: string) => SubmitResult;
    roundKey: string;
  }

  let { labels, status, submitGuess, roundKey }: Props = $props();

  let value = $state('');
  let error = $state('');
  let dropdown: CityDropdown;

  $effect(() => {
    roundKey;
    value = '';
    error = '';
    dropdown?.focus();
  });

  const onSubmit = () => {
    if (status !== 'playing') return;

    const result = submitGuess(value);
    if (!result.accepted) {
      error = result.reason === 'duplicate' ? 'Already guessed.' : 'Please choose a city from the list.';
      return;
    }

    error = '';
    value = '';
    dropdown?.blur();
  };
</script>

<form class="guess-form" onsubmit={(e) => { e.preventDefault(); onSubmit(); }}>
  <CityDropdown
    bind:this={dropdown}
    bind:value
    {labels}
    disabled={status !== 'playing'}
  />
  <button class="guess-btn" type="submit" disabled={status !== 'playing'}>Guess</button>
</form>
{#if error}
  <p class="input-error">{error}</p>
{/if}
