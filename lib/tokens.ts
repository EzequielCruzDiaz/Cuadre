export const colors = {
  bg: "#F4ECDF",
  surface: "#FFFCF6",
  surfaceAlt: "#FBF5EA",
  text: "#2A1D17",
  textMuted: "#6E5F55",
  textFaint: "#9A8A7C",
  border: "#E6D8C3",
  borderStrong: "#D5C2A5",
  accent: "#B8471F",
  positive: "#3E7B4F",
  mango: "#F2B23E",
  mangoSoft: "#FFF6E3",
  caribe: "#1F6E86",
  monte: "#17332A",
  monteSoft: "#21443A",
  sidebarBg: "#17332A",
  sidebarText: "#F4ECDF",
  sidebarMuted: "#93A79B",
  /** Versiones oscuras para el "canto" de botones y sellos (efecto tinta/relieve). */
  accentDeep: "#8E3414",
  mangoDeep: "#C98A1B",
} as const;

export const font = {
  family: "var(--font-sans), 'Manrope', -apple-system, sans-serif",
  display: "var(--font-display), 'Fraunces', Georgia, serif",
  mono: "ui-monospace, 'SF Mono', Menlo, monospace",
} as const;

export const radius = { sm: 8, md: 12, lg: 16, xl: 22 } as const;

export const shadow = {
  // "Lomo de libreta": un canto sólido abajo (como hojas apiladas) + sombra suave.
  card: "0 3px 0 #E6D8C3, 0 14px 22px -16px rgba(42,29,23,0.28)",
  raised: "0 5px 0 #D5C2A5, 0 22px 34px -18px rgba(42,29,23,0.4)",
} as const;

export const numeric = { fontVariantNumeric: "tabular-nums" } as const;
