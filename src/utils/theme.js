export const THEME_STORAGE_KEY = 'gorse-dashboard-theme';
export const LIGHT_THEME = 'light';
export const DARK_THEME = 'dark';
export const LIGHT_THEME_COLOR = '#ffffff';
export const DARK_THEME_COLOR = '#111827';

const THEME_COLOR_META_NAME = 'theme-color';

function canUseDOM() {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function normalizeTheme(theme) {
  return theme === DARK_THEME ? DARK_THEME : LIGHT_THEME;
}

function getThemeColor(theme) {
  return normalizeTheme(theme) === DARK_THEME ? DARK_THEME_COLOR : LIGHT_THEME_COLOR;
}

function applyBrowserThemeColor(theme) {
  let themeColorMeta = document.querySelector(`meta[name="${THEME_COLOR_META_NAME}"]`);
  if (!themeColorMeta) {
    themeColorMeta = document.createElement('meta');
    themeColorMeta.setAttribute('name', THEME_COLOR_META_NAME);
    document.head.appendChild(themeColorMeta);
  }
  themeColorMeta.setAttribute('content', getThemeColor(theme));
}

export function getStoredTheme() {
  if (!canUseDOM()) {
    return null;
  }

  try {
    const theme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return theme === DARK_THEME || theme === LIGHT_THEME ? theme : null;
  } catch (error) {
    return null;
  }
}

export function getSystemTheme() {
  if (!canUseDOM() || !window.matchMedia) {
    return LIGHT_THEME;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? DARK_THEME : LIGHT_THEME;
}

export function getPreferredTheme() {
  return getStoredTheme() || getSystemTheme();
}

export function getCurrentTheme() {
  if (!canUseDOM()) {
    return LIGHT_THEME;
  }

  return normalizeTheme(document.documentElement.getAttribute('data-theme') || getPreferredTheme());
}

export function applyTheme(theme) {
  const normalizedTheme = normalizeTheme(theme);

  if (!canUseDOM()) {
    return normalizedTheme;
  }

  document.documentElement.setAttribute('data-theme', normalizedTheme);
  document.documentElement.style.colorScheme = normalizedTheme;
  applyBrowserThemeColor(normalizedTheme);

  if (typeof window.CustomEvent === 'function') {
    window.dispatchEvent(new window.CustomEvent('dashboard-theme-change', {
      detail: { theme: normalizedTheme },
    }));
  }

  return normalizedTheme;
}

export function setTheme(theme) {
  const normalizedTheme = normalizeTheme(theme);

  if (canUseDOM()) {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, normalizedTheme);
    } catch (error) {
      // Ignore storage failures so theme switching still works for the current page.
    }
  }

  return applyTheme(normalizedTheme);
}
