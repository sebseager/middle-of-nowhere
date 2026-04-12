<script lang="ts">
  import GuessInput from './lib/GuessInput.svelte';
  import GuessList from './lib/GuessList.svelte';
  import Map from './lib/Map.svelte';
  import ResultOverlay from './lib/ResultOverlay.svelte';
  import { CITY_LABELS } from './lib/cities';
  import { gameStore, ZOOM_STEPS } from './lib/gameStore';

  const game = gameStore;

  let roundCounter = $state(0);

  const startNewRound = () => {
    game.startNewRound();
    roundCounter += 1;
  };
</script>

<div class="app-shell">
  <header class="topbar">
    <h1>UNZOOMED</h1>
    <p>Guess the mystery U.S. city in 6 tries.</p>
  </header>

  <main class="game-area">
    <GuessList guesses={$game.guesses} />
    <GuessInput
      labels={CITY_LABELS}
      status={$game.status}
      submitGuess={game.submitGuess}
      roundKey={`${$game.target.city}-${$game.target.abbr}-${roundCounter}`}
    />
    <div class="map-wrap">
      <Map
        target={$game.target}
        minZoom={ZOOM_STEPS[$game.currentZoomLevel]}
        showResult={$game.status !== 'playing'}
        resultLabel={`${$game.target.city}, ${$game.target.abbr}`}
      />
      <ResultOverlay status={$game.status} target={$game.target} {startNewRound} />
    </div>
  </main>
</div>
