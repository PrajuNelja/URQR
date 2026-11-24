import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles, Eye, EyeOff, X } from "lucide-react";
import { Button } from "../../../components/Buttons/Button";
import { InputField } from "../../../components/InputField/InputField";
import { Logo } from "../../../components/Logo/Logo";
import { Notification } from "../../../components/Notification/Notification";
import { LOGIN_COPY, LOGIN_HIGHLIGHTS } from "../Config/Login.config";
import { useManagerLogin } from "../Hooks/useManagerLogin";
import { LoginRequestSchema, type LoginRequest } from "@urqr/types";

const ManagerLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { feedback, dismissFeedback } = useManagerLogin();

  const {
    register,
    handleSubmit,
    setValue, // Needed for the clear button
    watch,    // Needed to track if there's text to clear
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>({
    resolver: zodResolver(LoginRequestSchema),
    defaultValues: {
      tenantSlug: "grand-horizon", 
      username: "",
      password: "",
    },
  });

  // Watch the tenantSlug to show/hide the clear (X) button
  const tenantSlugValue = watch("tenantSlug");

  const onSubmit = async (data: LoginRequest) => {
    console.log("Form Data Validated:", data);
    await new Promise((resolve) => setTimeout(resolve, 1500));
  };

  return (
    <main className="min-h-screen bg-bg flex flex-col lg:flex-row font-sans">
      <Notification
        isOpen={feedback.isOpen}
        type={feedback.type}
        message={feedback.message}
        onClose={dismissFeedback}
      />

      {/* ── LEFT PANEL ── */}
      <section className="relative w-full lg:w-[50%] bg-primary text-surface p-8 md:p-16 lg:p-24 flex flex-col justify-center overflow-hidden min-h-[50vh] lg:min-h-screen">
        <div className="hidden lg:block absolute top-0 right-0 w-[120%] h-full bg-bg rounded-l-[100%] translate-x-[65%] pointer-events-none" />
        
        <div className="relative z-10 w-full max-w-[420px] ml-auto mr-auto lg:ml-0 lg:mr-0 flex flex-col h-full justify-between py-8 lg:py-16">
          <div>
            <div className="flex items-center gap-3 mb-12">
              <span className="w-1.5 h-1.5 bg-surface/50 rounded-full" />
              <p className="font-bold tracking-[0.2em] text-xs uppercase text-surface/80">
                {LOGIN_COPY.brand}
              </p>
            </div>
            <h1 className="text-4xl lg:text-[56px] font-semibold leading-[1.1] mb-6 tracking-tight">
              {LOGIN_COPY.headline}
            </h1>
            <p className="text-base lg:text-lg text-surface/90 leading-relaxed max-w-[340px]">
              {LOGIN_COPY.description}
            </p>
          </div>
          <div className="mt-16 lg:mt-auto space-y-4">
            {LOGIN_HIGHLIGHTS.map((highlight) => (
              <div key={highlight} className="inline-flex items-center gap-3 bg-surface/20 px-5 py-3.5 rounded-full text-sm font-medium border border-surface/10 w-fit">
                <Sparkles size={16} className="text-surface" aria-hidden="true" />
                <span>{highlight}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RIGHT PANEL ── */}
      <section className="flex-1 flex flex-col justify-center items-center p-8 lg:p-16 bg-bg">
        <div className="w-full max-w-[360px]">
          
          <div className="text-center mb-10">
            <div className="w-14 h-14 bg-primary rounded-[12px] flex items-center justify-center text-surface mx-auto mb-6">
              <Logo size="md" showText={false} />
            </div>
            <h2 className="text-[28px] font-semibold text-text mb-2 leading-tight">
              {LOGIN_COPY.welcome}
            </h2>
            <p className="text-[14px] text-text-muted">
              {LOGIN_COPY.instructions}
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            
            {/* 1. TENANT SLUG FIELD (New Requirement) */}
            <div className="relative">
              <InputField
                label="TENANT SLUG"
                type="text"
                placeholder="e.g., grand-horizon"
                {...register("tenantSlug")}
                error={errors.tenantSlug?.message}
                className="bg-surface border-border focus:border-primary h-[48px] rounded-md text-[14px] px-4 pr-10"
              />
              {/* Clear button (only shows if there's text) */}
              {tenantSlugValue && (
                <button
                  type="button"
                  onClick={() => setValue("tenantSlug", "", { shouldValidate: true })}
                  className="absolute right-3 top-[38px] text-text-muted hover:text-text transition-colors"
                  aria-label="Clear tenant slug"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* 2. Username Field */}
            <InputField
              label="USER NAME"
              type="text"
              placeholder="e.g., MGR-8902"
              {...register("username")}
              error={errors.username?.message}
              className="bg-surface border-border focus:border-primary h-[48px] rounded-md text-[14px] px-4"
            />
            
            {/* 3. Password Field with Toggle */}
            <div className="relative">
              <InputField
                label="PASSWORD"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password")}
                error={errors.password?.message}
                className="bg-surface border-border focus:border-primary h-[48px] rounded-md text-[14px] px-4 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[38px] text-text-muted hover:text-text transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <Button
              type="submit"
              size="lg"
              fullWidth
              disabled={isSubmitting}
              className="bg-primary text-onPrimary hover:bg-primary-dark mt-2 h-[48px] rounded-md text-[14px] font-semibold transition-colors"
            >
              {isSubmitting ? "Signing In..." : LOGIN_COPY.submitLabel}
            </Button>
          </form>

          <p className="text-center text-[13px] text-text-muted mt-6">
            {LOGIN_COPY.credentialsHint}
          </p>
        </div>
      </section>
    </main>
  );
};

export default ManagerLogin;