// src/components/Showcase.tsx
// import { Button } from "./Buttons/Button";
// import { InputField } from "./InputField/InputField"; // We will add this next!

export default function Showcase() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif text-primary mb-2">Component Showcase</h1>
        <p className="text-text-muted">Testing all reusable components with the Ivory Luxe theme.</p>
      </div>

      {/* Buttons Section */}
      <section className="bg-surface p-6 rounded-md border border-border-subtle shadow-sm">
        <h2 className="text-xl font-serif text-primary mb-4 border-b border-border-subtle pb-2">
          Buttons
        </h2>
        
        <div className="flex flex-wrap gap-4 items-center">
          {/* <Button variant="primary">Primary Action</Button>
          <Button variant="secondary">Secondary Action</Button>
          <Button variant="outline">Outline Action</Button>
          <Button variant="ghost">Ghost Action</Button>
          <Button variant="primary" isLoading>Processing...</Button>
          <Button variant="primary" disabled>Disabled</Button> */}
        </div>
      </section>

      {/* Input Field Section (Coming next) */}
      <section className="bg-surface p-6 rounded-md border border-border-subtle shadow-sm">
        <h2 className="text-xl font-serif text-primary mb-4 border-b border-border-subtle pb-2">
          Input Fields
        </h2>
        <p className="text-sm text-text-muted">Will be added here next.</p>
      </section>

    </div>
  );
}