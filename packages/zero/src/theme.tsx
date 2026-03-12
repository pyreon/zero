import { signal, effect, onMount } from "@pyreon/reactivity"

// ─── Theme system ───────────────────────────────────────────────────────────
//
// Provides dark/light/system theme support with:
// - System preference detection via matchMedia
// - Persistent preference via localStorage
// - No flash of wrong theme (inline script in HTML)
// - Reactive theme signal for components

export type Theme = "light" | "dark" | "system"

const STORAGE_KEY = "zero-theme"

/** Reactive theme signal. */
export const theme = signal<Theme>("system")

/** Computed resolved theme (what's actually applied). */
export function resolvedTheme(): "light" | "dark" {
  const t = theme()
  if (t === "system") {
    if (typeof window === "undefined") return "dark"
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
  }
  return t
}

/** Toggle between light and dark. */
export function toggleTheme() {
  const current = resolvedTheme()
  setTheme(current === "dark" ? "light" : "dark")
}

/** Set theme explicitly. */
export function setTheme(t: Theme) {
  theme(t)
  if (typeof document !== "undefined") {
    document.documentElement.dataset.theme = resolvedTheme()
    try {
      localStorage.setItem(STORAGE_KEY, t)
    } catch {}
  }
}

/**
 * Initialize the theme system. Call once in your app entry or layout.
 * Reads from localStorage, listens for system preference changes.
 */
export function initTheme() {
  onMount(() => {
    // Read persisted preference
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
      if (stored === "light" || stored === "dark" || stored === "system") {
        theme(stored)
      }
    } catch {}

    // Apply to document
    document.documentElement.dataset.theme = resolvedTheme()

    // Watch for system preference changes
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    function onChange() {
      if (theme() === "system") {
        document.documentElement.dataset.theme = resolvedTheme()
      }
    }
    mq.addEventListener("change", onChange)

    // Re-apply when theme signal changes
    effect(() => {
      document.documentElement.dataset.theme = resolvedTheme()
    })
  })
}

/**
 * Theme toggle button component.
 *
 * @example
 * import { ThemeToggle } from "@pyreon/zero/theme"
 * <ThemeToggle />
 */
export function ThemeToggle(props: { class?: string; style?: string }) {
  initTheme()

  return (
    <button
      class={props.class}
      style={props.style}
      onclick={toggleTheme}
      aria-label="Toggle theme"
      title="Toggle theme"
      type="button"
    >
      {() =>
        resolvedTheme() === "dark" ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )
      }
    </button>
  )
}

/**
 * Inline script to prevent flash of wrong theme.
 * Include this in your index.html <head> BEFORE any stylesheets.
 *
 * @example
 * // index.html
 * <head>
 *   <script>{themeScript}</script>
 *   ...
 * </head>
 */
export const themeScript = `(function(){try{var t=localStorage.getItem("${STORAGE_KEY}");var r=t==="light"?"light":t==="dark"?"dark":window.matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light";document.documentElement.dataset.theme=r}catch(e){}})()`
