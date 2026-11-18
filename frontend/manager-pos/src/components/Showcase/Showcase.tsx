// src/components/Showcase.tsx

import { Logo } from "../Logo/Logo";

// 1. Imports

// 2. Component
export default function Showcase() {
  // 3. Export / Return
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif text-primary mb-2">Component Showcase</h1>
        <p className="text-text-muted">Testing all reusable components with the Ivory Luxe theme.</p>
      </div>

      {/* Logo Section */}
      <section className="bg-surface p-6 rounded-md border border-border-subtle shadow-sm">
        <h2 className="text-xl font-serif text-primary mb-4 border-b border-border-subtle pb-2">
          Logo
        </h2>
        <div className="flex flex-col gap-6">
          <Logo size="sm" />
          <Logo size="md" />
          <Logo size="lg" />
          <Logo size="md" showText={false} />
        </div>
      </section>

    </div>
  );
}