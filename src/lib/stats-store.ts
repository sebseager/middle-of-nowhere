const STORAGE_KEY = "mon-stats";

export interface GameStats {
  played: number;
  won: number;
  currentStreak: number;
  maxStreak: number;
  /** Wins by guess count: index 0 = won in 1, index 5 = won in 6 */
  distribution: [number, number, number, number, number, number];
}

const EMPTY_STATS: GameStats = {
  played: 0,
  won: 0,
  currentStreak: 0,
  maxStreak: 0,
  distribution: [0, 0, 0, 0, 0, 0],
};

export function loadStats(): GameStats {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw)
      return { ...EMPTY_STATS, distribution: [...EMPTY_STATS.distribution] };
    const parsed = JSON.parse(raw);
    return {
      played: parsed.played ?? 0,
      won: parsed.won ?? 0,
      currentStreak: parsed.currentStreak ?? 0,
      maxStreak: parsed.maxStreak ?? 0,
      distribution:
        Array.isArray(parsed.distribution) && parsed.distribution.length === 6
          ? (parsed.distribution as GameStats["distribution"])
          : [...EMPTY_STATS.distribution],
    };
  } catch {
    return { ...EMPTY_STATS, distribution: [...EMPTY_STATS.distribution] };
  }
}

function saveStats(stats: GameStats): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

export function recordGame(won: boolean, guessCount: number): GameStats {
  const stats = loadStats();

  stats.played += 1;

  if (won) {
    stats.won += 1;
    stats.currentStreak += 1;
    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
    const idx = Math.min(Math.max(guessCount - 1, 0), 5);
    stats.distribution[idx] += 1;
  } else {
    stats.currentStreak = 0;
  }

  saveStats(stats);
  return stats;
}
