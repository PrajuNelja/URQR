// src/pages/Table_Management/Components/ManagerLogin.tsx

import { useEffect, useRef, useState } from "react";
import { Sparkles, Eye, EyeOff } from "lucide-react";

import { Button } from "../../../components/Buttons/Button";
import { InputField } from "../../../components/InputField/InputField";
import { Notification } from "../../../components/Notification/Notification";
import { SessionTimeoutModal } from "../../../components/PopupModal/SessionTimeoutModal";

import { LOGIN_COPY, LOGIN_HIGHLIGHTS } from "../Config/Login.config";
import { useManagerLogin } from "../Hooks/useManagerLogin";

// en-IN date helper ("Tue, 24 Nov 2026")
const formatToday = () => {
  const now = new Date();
  const weekday = now.toLocaleDateString("en-IN", { weekday: "short" });
  const day = String(now.getDate()).padStart(2, "0");
  const month = now.toLocaleDateString("en-IN", { month: "short" });
  return `${weekday}, ${day} ${month} ${now.getFullYear()}`;
};

const ManagerLogin = () => {
  const { form, feedback, isSubmitting, onSubmit, dismissFeedback } =
    useManagerLogin();
  const { errors } = form.formState;

  const [showPassword, setShowPassword] = useState(false);
  const [today, setToday] = useState(formatToday());
  const [isTimeoutOpen, setIsTimeoutOpen] = useState(false);
  
  // NEW: Theme state (defaults to light since your index.html has class="light")
  const [isDark, setIsDark] = useState(() => 
    document.documentElement.classList.contains("dark")
  );

  const formRef = useRef<HTMLFormElement>(null);

  // Touchscreen spec: scroll focused input into view
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.tagName === "INPUT") {
        setTimeout(() => {
          target.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 50);
      }
    };
    const el = formRef.current;
    if (!el) return;
    el.addEventListener("focusin", handleFocusIn);
    return () => el.removeEventListener("focusin", handleFocusIn);
  }, []);

  // Touchscreen spec: block Enter key on inputs
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  // Refresh date at local midnight
  useEffect(() => {
    const tick = () => setToday(formatToday());
    const interval = setInterval(tick, 60_000);
    return () => clearInterval(interval);
  }, []);

  // NEW: Apply dark class to <html> when toggled
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <main className="min-h-screen bg-bg font-sans transition-colors duration-200">
      <Notification
        isOpen={feedback.isOpen}
        type={feedback.type}
        message={feedback.message}
        onClose={dismissFeedback}
      />

      {/* ── 72px STICKY HEADER (matches your screenshot) ── */}
      <header className="sticky top-0 z-30 h-[72px] border-b border-border bg-surface">
        <div className="mx-auto flex h-full max-w-[1920px] items-center justify-between gap-4 px-6">
          
          {/* Left: Logo + URQR */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-dashed border-primary text-[10px] font-medium text-text-secondary">
              Logo
            </div>
            <span className="text-[18px] leading-[22px] font-bold tracking-tight text-text">
              URQR
            </span>
          </div>

          {/* Right: Online + Date + Timeout + Theme */}
          <div className="flex items-center gap-2.5">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border bg-success-bg px-3 py-1.5 text-xs font-medium text-success">
              <span className="h-2 w-2 rounded-full bg-success" />
              Online
            </span>
            
            <span className="hidden md:inline-flex items-center rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text">
              {today}
            </span>

            {/* NEW: Timeout Modal Trigger */}
            <button
              type="button"
              onClick={() => setIsTimeoutOpen(true)}
              className="inline-flex h-8 items-center gap-1 rounded-md border border-border bg-warning-bg px-2.5 text-xs font-medium text-warning hover:opacity-90 transition-opacity"
            >
              Timeout Modal
            </button>

            {/* NEW: Dark/Light Theme Toggle */}
            <button
              type="button"
              onClick={() => setIsDark((d) => !d)}
              aria-label="Toggle dark sepia theme"
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-surface-alt px-2.5 text-xs font-medium text-text hover:bg-border/40 transition-colors"
            >
              <span>{isDark ? "Light" : "Dark"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── SPLIT CANVAS ── */}
      <div className="relative min-h-[calc(100vh-72px)] overflow-hidden">
        <div
          className="hidden lg:block absolute top-[-22%] left-[-26%] w-[82%] h-[158%] bg-primary-dark pointer-events-none"
          style={{ borderRadius: "0 52% 48% 0 / 0 68% 60% 0" }}
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto grid min-h-[calc(100vh-72px)] max-w-[1920px] grid-cols-1 lg:grid-cols-12">
          
          {/* ── LEFT BRAND REGION ── */}
          <div className="flex flex-col justify-between px-6 py-12 sm:px-10 lg:col-span-6 lg:px-16 lg:py-20 bg-primary-dark lg:bg-transparent text-on-primary">
            <div className="max-w-lg space-y-6">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-on-primary/70">
                <span className="h-1.5 w-1.5 rounded-full bg-on-primary/70" />
                <span>{LOGIN_COPY.brand}</span>
              </div>

              <h1 className="text-4xl font-semibold tracking-tight sm:text-[56px] sm:leading-[68px]">
                Where every
                <br />
                table runs itself.
              </h1>

              <p className="text-lg leading-relaxed sm:text-[22px] sm:leading-[34px] font-normal text-on-primary/90">
                {LOGIN_COPY.description}
              </p>
            </div>

            <div className="mt-10 flex flex-col items-start gap-4 lg:mt-16">
              {LOGIN_HIGHLIGHTS.map((highlight) => (
                <div
                  key={highlight}
                  className="inline-flex h-[52px] items-center gap-3 rounded-full bg-on-primary/20 px-5 text-[16px] leading-[24px] font-semibold border border-on-primary/10"
                >
                  <Sparkles size={16} aria-hidden="true" />
                  <span>{highlight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT SIGN-IN REGION ── */}
          <div
            className="flex items-center justify-center px-6 py-10 sm:px-8 lg:col-span-6 lg:py-12"
            style={{ paddingBottom: "max(40px, env(safe-area-inset-bottom))" }}
          >
            <div className="w-full max-w-[360px]">
              {/* Brand mark + intro */}
              <div className="flex flex-col items-center text-center">
                <div
                  className="flex h-[56px] w-[56px] items-center justify-center rounded-[12px] bg-primary-dark text-2xl text-on-primary"
                  aria-hidden="true"
                >
                  ✦
                </div>

                <h2 className="mt-4 text-[28px] leading-[36px] font-semibold tracking-tight text-text whitespace-pre-line">
                  {LOGIN_COPY.welcome}
                </h2>

                <p className="mt-4 text-[14px] leading-[22px] font-normal text-text-secondary">
                  {LOGIN_COPY.instructions}
                </p>
              </div>

              {/* Form */}
              <form
                ref={formRef}
                onSubmit={onSubmit}
                noValidate
                className="mt-[40px] space-y-[24px]"
              >
                <InputField
                  label={LOGIN_COPY.usernameLabel}
                  type="text"
                  autoComplete="username"
                  placeholder={LOGIN_COPY.usernamePlaceholder}
                  fieldSize="lg"
                  error={errors.username?.message}
                  disabled={isSubmitting}
                  enterKeyHint="done"
                  onKeyDown={handleInputKeyDown}
                  {...form.register("username")}
                />

                <InputField
                  label={LOGIN_COPY.passwordLabel}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder={LOGIN_COPY.passwordPlaceholder}
                  fieldSize="lg"
                  error={errors.password?.message}
                  disabled={isSubmitting}
                  enterKeyHint="done"
                  onKeyDown={handleInputKeyDown}
                  suffix={
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      onMouseDown={(e) => e.preventDefault()}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                      className="inline-flex h-12 w-12 items-center justify-center rounded-md text-text-secondary hover:text-text transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  }
                  {...form.register("password")}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="login"
                  fullWidth
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? LOGIN_COPY.submittingLabel : LOGIN_COPY.submitLabel}
                </Button>
              </form>

              <p className="mt-[20px] text-center text-[13px] leading-[20px] font-normal text-text-secondary">
                {LOGIN_COPY.demoHint}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── SESSION TIMEOUT MODAL ── */}
      <SessionTimeoutModal
        isOpen={isTimeoutOpen}
        onClose={() => setIsTimeoutOpen(false)}
        initialSeconds={60}
        onExtend={() => {
          setIsTimeoutOpen(false);
          // TODO: Refresh JWT
        }}
        onLogout={() => {
          setIsTimeoutOpen(false);
          // TODO: clearAuth() + navigate("/login")
        }}
      />
    </main>
  );
};

export default ManagerLogin;