<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { SubmitResult } from './gameStore';

  interface Props {
    labels: string[];
    status: 'playing' | 'won' | 'lost';
    submitGuess: (input: string) => SubmitResult;
    roundKey: string;
  }

  let { labels, status, submitGuess, roundKey }: Props = $props();

  const dispatch = createEventDispatcher<{ submitted: void }>();

  let value = $state('');
  let error = $state('');
  let inputEl: HTMLInputElement | null = null;

  let filteredLabels = $derived.by(() => {
    const q = value.trim().toLowerCase();
    if (!q) return labels;
    return labels.filter((label) => label.toLowerCase().includes(q));
  });

  $effect(() => {
    roundKey;
    value = '';
    error = '';
    inputEl?.focus();
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
    inputEl?.blur();
    dispatch('submitted');
  };
</script>

<form class="guess-form" on:submit|preventDefault={onSubmit}>
  <input
    bind:this={inputEl}
    bind:value
    class="guess-input"
    type="text"
    list="city-options"
    placeholder="Guess a city, e.g. Albany, NY"
    disabled={status !== 'playing'}
    autocomplete="off"
  />
  <datalist id="city-options">
    {#each filteredLabels as label}
      <option value={label}></option>
    {/each}
  </datalist>
  <button class="guess-btn" type="submit" disabled={status !== 'playing'}>Guess</button>
</form>
{#if error}
  <p class="input-error">{error}</p>
{/if}
