import { useEffect, useRef, useState } from "react";
import { Sparkles, Eye, EyeOff } from "lucide-react";

import { Button } from "../../../components/Buttons/Button";
import { InputField } from "../../../components/InputField/InputField";
import { Notification } from "../../../components/Notification/Notification";
import { SessionTimeoutModal } from "../../../components/PopupModal/SessionTimeoutModal";

import { LOGIN_COPY, LOGIN_HIGHLIGHTS } from "../Config/Login.config";
import { useManagerLogin } from "../Hooks/useManagerLogin";

const formatToday = () => {
  const now = new Date();
  const weekday = now.toLocaleDateString("en-IN", { weekday: "short" });
  const day = String(now.getDate()).padStart(2, "0");
  const month = now.toLocaleDateString("en-IN", { month: "short" });
  return `${weekday}, ${day} ${month} ${now.getFullYear()}`;
};

const ManagerLogin = () => {
  const { form, feedback, isSubmitting, onSubmit, dismissFeedback } = useManagerLogin();
  const { errors } = form.formState;

  const [showPassword, setShowPassword] = useState(false);
  const [today, setToday] = useState(formatToday());
  const [isTimeoutOpen, setIsTimeoutOpen] = useState(false);

  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const handleFocusIn = (event: globalThis.FocusEvent) => {
      const target = event.target;
      if (target instanceof HTMLInputElement && formRef.current?.contains(target)) {
        window.setTimeout(() => {
          target.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 150);
      }
    };
    const currentForm = formRef.current;
    if (!currentForm) return;
    currentForm.addEventListener("focusin", handleFocusIn);
    return () => currentForm.removeEventListener("focusin", handleFocusIn);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => setToday(formatToday()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

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
    <main className="flex h-screen flex-col overflow-hidden bg-bg font-sans transition-colors duration-200">
      <Notification
        isOpen={feedback.isOpen}
        type={feedback.type}
        message={feedback.message}
        onClose={dismissFeedback}
      />

      {/* HEADER */}
      <header className="sticky top-0 z-30 h-[72px] shrink-0 border-b border-border bg-surface">
        <div className="mx-auto flex h-full max-w-[1920px] items-center justify-between gap-4 px-6">
          
          {/* LOGO & BRAND */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-dashed border-primary/50 text-[10px] font-medium text-text-secondary">
              Logo
            </div>
            <span className="text-[18px] font-bold leading-[22px] tracking-tight text-text">
              URQR
            </span>
          </div>

          {/* HEADER ACTIONS */}
          <div className="flex items-center gap-2.5">
            <span className="hidden h-9 items-center gap-1.5 rounded-full border border-border bg-success-bg px-3 text-xs font-medium text-success sm:inline-flex">
              <span className="h-2 w-2 rounded-full bg-success" />
              Online
            </span>

            <span className="hidden h-9 items-center rounded-md border border-border bg-surface px-3 text-xs font-medium text-text md:inline-flex">
              {today}
            </span>

            <button
              type="button"
              onClick={() => setIsTimeoutOpen(true)}
              className="urqr-focus inline-flex h-9 items-center justify-center rounded-md border border-border bg-warning-bg px-3 text-xs font-medium text-warning transition-opacity hover:opacity-90"
            >
              Timeout Modal
            </button>

            <button
              type="button"
              onClick={() => setIsDark((previous) => !previous)}
              aria-label="Toggle dark sepia theme"
              aria-pressed={isDark}
              className="urqr-focus inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-border bg-surface-alt px-3 text-xs font-medium text-text transition-colors hover:bg-border/40"
            >
              {isDark ? "Light" : "Dark"}
            </button>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT WITH EXACT CURVE */}
      <div className="relative flex-1 overflow-y-auto">
        <div
          className="pointer-events-none absolute left-[-26%] top-[-22%] hidden h-[158%] w-[82%] bg-primary-dark lg:block"
          style={{ borderRadius: "0 52% 48% 0 / 0 68% 60% 0" }}
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto grid min-h-full max-w-[1920px] grid-cols-1 lg:grid-cols-12">
          
          {/* LEFT SECTION */}
          <section className="flex flex-col justify-center bg-primary-dark px-6 py-12 text-white sm:px-10 lg:col-span-6 lg:bg-transparent lg:px-16 lg:py-20">
            <div className="max-w-lg space-y-6">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                <span>{LOGIN_COPY.brand}</span>
              </div>
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-[56px] sm:leading-[68px]">
                {LOGIN_COPY.headline}
              </h1>
              <p className="text-lg font-normal leading-relaxed text-white/90 sm:text-[22px] sm:leading-[34px]">
                {LOGIN_COPY.description}
              </p>
            </div>

            <div className="mt-10 flex flex-col items-start gap-4 lg:mt-16">
              {LOGIN_HIGHLIGHTS.map((highlight) => (
                <div
                  key={highlight}
                  className="inline-flex min-h-[52px] items-center gap-3 rounded-full border border-white/10 bg-white/15 px-5 text-[14px] font-semibold leading-[24px] text-white sm:text-[16px]"
                >
                  <Sparkles size={16} className="text-white" aria-hidden="true" />
                  <span className="text-white">{highlight}</span>
                </div>
              ))}
            </div>
          </section>

          {/* RIGHT SECTION (FORM) */}
          <section
            className="flex items-center justify-center px-6 py-10 sm:px-8 lg:col-span-6 lg:py-12"
            style={{ paddingBottom: "max(40px, env(safe-area-inset-bottom))" }}
          >
            <div className="w-full max-w-[360px]">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-[56px] w-[56px] items-center justify-center rounded-[12px] bg-primary text-2xl text-on-primary" aria-hidden="true">
                  ✦
                </div>
                <h2 className="mt-4 whitespace-pre-line text-[28px] font-semibold leading-[36px] tracking-tight text-text">
                  {LOGIN_COPY.welcome}
                </h2>
                <p className="mt-4 text-[14px] font-normal leading-[22px] text-text-secondary">
                  {LOGIN_COPY.instructions}
                </p>
              </div>

              <form
                ref={formRef}
                onSubmit={onSubmit}
                noValidate
                aria-busy={isSubmitting}
                className="mt-[40px] space-y-[24px]"
              >
                {/* MANAGER ID */}
                <InputField
                  label={LOGIN_COPY.usernameLabel}
                  type="text"
                  autoComplete="username"
                  placeholder={LOGIN_COPY.usernamePlaceholder}
                  fieldSize="lg"
                  error={errors.username?.message}
                  disabled={isSubmitting}
                  {...form.register("username")}
                />

                {/* PASSWORD */}
                <InputField
                  label={LOGIN_COPY.passwordLabel}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder={LOGIN_COPY.passwordPlaceholder}
                  fieldSize="lg"
                  error={errors.password?.message}
                  disabled={isSubmitting}
                  suffix={
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      onMouseDown={(e) => e.preventDefault()}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                      disabled={isSubmitting}
                      className="flex h-11 w-11 items-center justify-center rounded-md text-text-secondary hover:text-text transition-colors"
                    >
                      {showPassword ? <EyeOff size={22} strokeWidth={1.8} /> : <Eye size={22} strokeWidth={1.8} />}
                    </button>
                  }
                  {...form.register("password")}
                />

                {/* BUTTON */}
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

              <p className="mt-[20px] text-center text-[13px] font-normal leading-[20px] text-text-secondary">
                {LOGIN_COPY.demoHint}
              </p>
            </div>
          </section>
        </div>
      </div>

      <SessionTimeoutModal
        isOpen={isTimeoutOpen}
        onClose={() => setIsTimeoutOpen(false)}
        initialSeconds={60}
        onExtend={() => setIsTimeoutOpen(false)}
        onLogout={() => setIsTimeoutOpen(false)}
      />
    </main>
  );
};

export default ManagerLogin;