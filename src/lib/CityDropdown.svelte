<script lang="ts">
  interface Props {
    labels: string[];
    value: string;
    disabled: boolean;
    placeholder?: string;
  }

  let {
    labels,
    value = $bindable(),
    disabled,
    placeholder = 'Guess a city, e.g. Albany, NY'
  }: Props = $props();

  let open = $state(false);
  let highlightIndex = $state(-1);
  let inputEl: HTMLInputElement | null = $state(null);

  let filtered = $derived.by(() => {
    const q = value.trim().toLowerCase();
    if (!q) return [];
    return labels.filter((l) => l.toLowerCase().includes(q)).slice(0, 8);
  });

  $effect(() => {
    filtered;
    highlightIndex = -1;
  });

  function handleInput(e: Event) {
    value = (e.target as HTMLInputElement).value;
    open = true;
  }

  function select(label: string) {
    value = label;
    open = false;
    highlightIndex = -1;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open && filtered.length > 0) {
        open = true;
        highlightIndex = 0;
        return;
      }
      if (open) highlightIndex = Math.min(highlightIndex + 1, filtered.length - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (open) highlightIndex = Math.max(highlightIndex - 1, 0);
    } else if (e.key === 'Enter' && open && highlightIndex >= 0 && highlightIndex < filtered.length) {
      e.preventDefault();
      e.stopPropagation();
      select(filtered[highlightIndex]);
    } else if (e.key === 'Escape') {
      open = false;
      highlightIndex = -1;
    }
  }

  function handleFocus() {
    if (value.trim() && filtered.length > 0) open = true;
  }

  function handleBlur() {
    setTimeout(() => {
      open = false;
    }, 150);
  }

  export function focus() {
    inputEl?.focus();
  }

  export function blur() {
    inputEl?.blur();
  }
</script>

<div class="dropdown-wrap">
  <input
    bind:this={inputEl}
    value={value}
    oninput={handleInput}
    onkeydown={handleKeydown}
    onfocus={handleFocus}
    onblur={handleBlur}
    class="dropdown-input"
    type="text"
    {placeholder}
    {disabled}
    autocomplete="off"
    role="combobox"
    aria-controls="city-listbox"
    aria-expanded={open && filtered.length > 0}
    aria-autocomplete="list"
  />
  {#if open && filtered.length > 0}
    <div class="dropdown-list" role="listbox" id="city-listbox">
      {#each filtered as label, i}
        <button
          class="dropdown-item"
          class:highlighted={i === highlightIndex}
          type="button"
          role="option"
          aria-selected={i === highlightIndex}
          onmousedown={(e) => { e.preventDefault(); select(label); }}
        >
          {label}
        </button>
      {/each}
    </div>
  {/if}
</div>
