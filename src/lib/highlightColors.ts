export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'orange' | 'purple' | 'cyan';

export interface ColorOption {
  id: HighlightColor;
  label: string;
  hex: string;
  dotBg: string;
  dotRing: string;
  markClass: string;
  hoverClass: string;
  badgeClass: string;
}

export const HIGHLIGHT_COLORS: ColorOption[] = [
  {
    id: 'yellow',
    label: 'Yellow',
    hex: '#fef08a',
    dotBg: 'bg-yellow-300',
    dotRing: 'ring-yellow-500',
    markClass: 'bg-yellow-200 text-slate-900 border-b-2 border-yellow-400/70',
    hoverClass: 'hover:bg-yellow-300',
    badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  },
  {
    id: 'green',
    label: 'Green',
    hex: '#a7f3d0',
    dotBg: 'bg-emerald-400',
    dotRing: 'ring-emerald-500',
    markClass: 'bg-emerald-200 text-slate-900 border-b-2 border-emerald-400/70',
    hoverClass: 'hover:bg-emerald-300',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  {
    id: 'blue',
    label: 'Blue',
    hex: '#bae6fd',
    dotBg: 'bg-sky-400',
    dotRing: 'ring-sky-500',
    markClass: 'bg-sky-200 text-slate-900 border-b-2 border-sky-400/70',
    hoverClass: 'hover:bg-sky-300',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-300',
  },
  {
    id: 'pink',
    label: 'Pink',
    hex: '#fbcfe8',
    dotBg: 'bg-pink-400',
    dotRing: 'ring-pink-500',
    markClass: 'bg-pink-200 text-slate-900 border-b-2 border-pink-400/70',
    hoverClass: 'hover:bg-pink-300',
    badgeClass: 'bg-pink-100 text-pink-800 border-pink-300',
  },
  {
    id: 'orange',
    label: 'Orange',
    hex: '#fed7aa',
    dotBg: 'bg-orange-400',
    dotRing: 'ring-orange-500',
    markClass: 'bg-orange-200 text-slate-900 border-b-2 border-orange-400/70',
    hoverClass: 'hover:bg-orange-300',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-300',
  },
  {
    id: 'purple',
    label: 'Purple',
    hex: '#e9d5ff',
    dotBg: 'bg-purple-400',
    dotRing: 'ring-purple-500',
    markClass: 'bg-purple-200 text-slate-900 border-b-2 border-purple-400/70',
    hoverClass: 'hover:bg-purple-300',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
  },
];

export const getHighlightColorConfig = (color?: string): ColorOption => {
  const normalized = (color || 'yellow').toLowerCase();
  if (normalized === 'cyan') {
    return HIGHLIGHT_COLORS[2]; // blue/cyan
  }
  const found = HIGHLIGHT_COLORS.find((c) => c.id === normalized);
  return found || HIGHLIGHT_COLORS[0];
};

export const getHighlightMarkClass = (color?: string): string => {
  const config = getHighlightColorConfig(color);
  return `${config.markClass} ${config.hoverClass}`;
};

const COLOR_STORAGE_KEY = 'jj_ielts_active_highlight_color';

export const getStoredHighlightColor = (): HighlightColor => {
  try {
    const val = localStorage.getItem(COLOR_STORAGE_KEY) as HighlightColor;
    if (val && HIGHLIGHT_COLORS.some((c) => c.id === val)) {
      return val;
    }
  } catch (e) {
    // Ignore storage errors
  }
  return 'yellow';
};

export const setStoredHighlightColor = (color: HighlightColor): void => {
  try {
    localStorage.setItem(COLOR_STORAGE_KEY, color);
  } catch (e) {
    // Ignore storage errors
  }
};
