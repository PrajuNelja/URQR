// src/components/Showcase/Showcase.tsx

// 1. Imports
import { useState } from "react";
import { Logo } from "../Logo/Logo";
import { InputField } from "../InputField/InputField";

// 2. Component
export default function Showcase() {
  // 3. State
  // State for the quantity stepper
  const [quantity, setQuantity] = useState(1); 
  // State for email validation
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  // 4. Handlers
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);

    // Real-time validation logic
    if (val === "") {
      setEmailError("Email is required.");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      setEmailError("Please enter a valid email address.");
    } else {
      setEmailError(""); // Clear error when email becomes valid
    }
  };

  // 5. Export / Return
  return (
    <div className="min-h-screen bg-app-bg p-8 max-w-6xl mx-auto space-y-10">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif text-primary mb-2">Component Showcase</h1>
        <p className="text-text-muted font-sans">Testing all reusable components with the Ivory Luxe theme.</p>
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

      {/* Input Field Section */}
      <section className="bg-surface p-6 rounded-md border border-border-subtle shadow-sm">
        <h2 className="text-xl font-serif text-primary mb-4 border-b border-border-subtle pb-2">
          Input Fields
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* 1. Text Input */}
          <InputField 
            label="Full Name" 
            type="text" 
            placeholder="John Doe" 
            helperText="Enter your first and last name."
          />

          {/* 2. Password Input */}
          <InputField 
            label="Password" 
            type="password" 
            placeholder="••••••••" 
          />

          {/* 3. Search Input */}
          <InputField 
            label="Search" 
            type="search" 
            placeholder="Search orders..." 
          />

          {/* 4. Date Input */}
          <InputField 
            label="Order Date" 
            type="date" 
          />

          {/* 5. Email Validation Input */}
          <InputField 
            label="Email Address" 
            type="text" 
            value={email}
            onChange={handleEmailChange}
            error={emailError} 
            helperText="We will never share your email."
          />

          {/* 6. Quantity Stepper (Built into InputField) */}
          <InputField 
            label="Quantity"
            type="quantity"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            min={1}
            max={10}
          />

          {/* 7. Disabled State */}
          <InputField 
            label="System ID" 
            type="text" 
            defaultValue="SYS-001" 
            disabled 
          />
          
          {/* 8. Small Size Input */}
          <InputField 
            label="Small Input" 
            type="text" 
            inputSize="sm"
            placeholder="Small size..." 
          />

        </div>
      </section>

    </div>
  );
}