// src/components/PopupModal/PopupModal.config.ts

export const popupModalConfig = {
  overlay: "fixed inset-0 z-50 flex items-center justify-center bg-primary/40 backdrop-blur-sm transition-opacity",
  container: "bg-surface w-full max-w-md rounded-md border border-border-subtle shadow-md flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200",
  header: "flex items-center justify-between p-5 border-b border-border-subtle",
  title: "text-xl font-serif font-semibold text-primary",
  closeBtn: "text-text-muted hover:text-primary transition-colors",
  body: "p-5 text-sm text-text-muted overflow-y-auto max-h-[60vh]",
  footer: "flex items-center justify-end gap-3 p-5 border-t border-border-subtle bg-app-bg/50",
};