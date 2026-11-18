// src/components/DataCard/DataCard.config.ts

export const dataCardConfig = {
  base: "bg-surface rounded-md border border-border-subtle shadow-sm overflow-hidden flex flex-col",
  header: "flex items-center gap-3 p-4 border-b border-border-subtle",
  title: "text-sm font-semibold text-text-muted uppercase tracking-wider",
  iconWrapper: "p-2 rounded-sm bg-app-bg text-primary flex items-center justify-center",
  body: "p-4 flex-1",
  
  // Specific variants
  summary: {
    value: "text-3xl font-serif font-bold text-primary mt-2",
    trend: "text-sm font-medium text-green-600 mt-1 flex items-center gap-1",
  },
  info: {
    // styles for info cards
  },
  content: {
    // styles for content cards
  }
};